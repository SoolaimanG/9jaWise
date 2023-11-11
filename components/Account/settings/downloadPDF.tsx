import Button from "@/components/button";

//----------->All Imports<-------------
import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { useStore } from "@/provider";
import { historyProps } from "@/Models/user";
import { format } from "date-fns";

const download_pdf = async (data: historyProps[], name: string = "User") => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);

  //PDF page and size weight not used >
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Define the content of the invoice list
  const tableContent = [
    [
      `S/N`,
      "Customer",
      "Transaction From",
      "Transaction To",
      "Amount",
      "Transaction Type",
      "Date",
    ],
  ];
  data.forEach((invoice, index) => {
    tableContent.push([
      `${index + 1}`,
      invoice.name,
      invoice.transactionFrom as string,
      invoice.transactionTo as string,
      `$${invoice.amount}`,
      `${invoice.type}`,
      format(invoice.date, "PPP"),
    ]);
    y -= 20; // Adjust Y position for the next row
  });

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Draw the table on the page
  page.setFont(helveticaFont);
  page.drawText("Transactions", {
    x: margin,
    y,
    size: 18,
    color: rgb(0, 0, 0),
  });
  y -= 20;
  tableContent.forEach((row) => {
    row.forEach((cell, columnIndex) => {
      page.drawText(cell, {
        x: margin + columnIndex * 150, // Adjust column positions as needed
        y,
        size: 12,
        color: rgb(0, 0, 0),
      });
    });
    y -= 20; // Adjust Y position for the next row
  });

  // Calculate the total amount received and sent
  const totalReceived = data
    .filter((trans) => {
      return trans.type !== "credit";
    })
    .reduce((acc, cur) => {
      return acc + cur.amount;
    }, 0);

  const totalSent = data
    .filter((trans) => {
      return trans.type !== "debit";
    })
    .reduce((acc, cur) => {
      return acc + cur.amount;
    }, 0);

  // Draw the total amount on the page
  y -= 20;
  page.drawText(`Total Sent: N${totalReceived}`, {
    x: margin,
    y,
    size: 14,
    color: rgb(0, 0, 0),
  });
  y -= 20;
  page.drawText(`Total Recieved: N${totalSent}`, {
    x: margin,
    y,
    size: 14,
    color: rgb(0, 0, 0),
  });

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();

  // Create a Blob from the PDF bytes
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  // Create a link to download the PDF
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${name}_transaction_reciept.pdf`; // Set a filename
  a.style.display = "none"; // Hide the link
  document.body.appendChild(a);

  // Trigger the click event of the hidden link to initiate the download
  a.click();

  // Clean up by removing the link element
  document.body.removeChild(a);
};

const DownloadPDF = ({ date }: { date: Date }) => {
  const { user } = useStore();
  const [state, setState] = useState({
    loading: false,
    downloaded: false,
    error: false,
  });

  return (
    <Button
      className="w-fit px-3 h-[2.5rem]"
      borderRadius
      name="Download PDF"
      varient="filled"
      states={
        state.loading
          ? "loading"
          : state.downloaded
          ? "complete"
          : state.error
          ? "failed"
          : undefined
      }
      disabled={!date ? true : false}
      onClick={() => {
        const get_transaction_with_date = user?.history.filter(
          (transaction) => {
            return transaction.date > new Date(date).getTime();
          }
        );
        download_pdf(
          get_transaction_with_date as historyProps[],
          user?.username
        )
          .then(() => {
            setState({ ...state, downloaded: true });
          })
          .catch(() => setState({ ...state, error: true }));
      }}
    />
  );
};

export default DownloadPDF;
