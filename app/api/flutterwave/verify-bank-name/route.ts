import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { AccountModel, account_number_props } from "@/Models/accountNumbers";
import { HTTP_STATUS } from "../../donation/withdraw/route";
import { closeConnection, connectDatabase } from "@/Models";

export const GET = async (req: Request) => {
  // Parse the URL for query parameters
  const urlParser = new URL(req.url);
  const account_number = urlParser.searchParams.get("account_number");
  const account_bank = urlParser.searchParams.get("account_bank");

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(null, {
      status: HTTP_STATUS.UNAUTHORIZED,
      statusText: "Unauthorized (Please Login)",
    });
  }

  if (account_bank?.trim().toLowerCase() === "01".toLowerCase()) {
    await connectDatabase();

    const account: account_number_props | null = await AccountModel.findOne({
      account_number: account_number,
    });

    //data.data.account_name
    const data = {
      account_name: account?.account_name,
    };

    if (account) {
      await closeConnection();
      return NextResponse.json({
        data: data,
        message: "success",
      });
    }
  }

  // Make a POST request to the Flutterwave API to fetch beneficiary data
  const res = await fetch(
    `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${account_bank}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY as string}`,
      },
    }
  );

  if (!res.ok) {
    // If the response from Flutterwave is not okay, return the same response
    //closeConnection();
    return new Response(null, {
      status: res.status,
      statusText: res.statusText,
    });
  }

  // Parse the response data
  const data = await res.json();
  // Return a JSON response with the fetched data and a success message
  return NextResponse.json({ data: data.data, message: "success" });
};
