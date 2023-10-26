import { BsFillCheckCircleFill } from "react-icons/bs";
import { AiFillCloseCircle } from "react-icons/ai";
import Chip from "./chip";
import Button from "./button";
import { stateProps } from "@/provider";
import { statusProps } from "./loaders";
import { FaTimes, FaTimesCircle } from "react-icons/fa";
import { useFormatDate } from "@/Hooks/useFormatDate";
import { transactiontypes } from "@/Models/user";
import { useNairaFormatter } from "@/Hooks/useNairaFormatter";

export type receiptProps = {
  status: statusProps;
  amount: number;
  refNumber: number;
  receiver: string;
  sender: string;
  payment_type: transactiontypes;
  payment_time: number;
};

const Receipt = (props: receiptProps) => {
  const {
    status,
    amount,
    receiver,
    refNumber,
    sender,
    payment_type,
    payment_time,
  } = props;

  const date = useFormatDate(payment_time);
  const naira = useNairaFormatter(amount);

  const receiptDetails = [
    {
      id: 1,
      desc: "Ref Number",
      prop: refNumber,
    },
    {
      id: 2,
      desc: "Receiver",
      prop: receiver,
    },
    {
      id: 4,
      desc: "Payment type",
      prop: payment_type[0].toUpperCase().concat(payment_type.substring(1)),
    },
    {
      id: 1,
      desc: "Payment time",
      prop: date,
    },
    {
      id: 3,
      desc: "Sender",
      prop: sender,
    },
  ];

  return (
    <div className="w-full flex items-center justify-center flex-col gap-2">
      <span
        className={`p-3 rounded-full ${
          status === "loading"
            ? "bg-yellow-100"
            : status === "failed"
            ? "bg-red-300"
            : "bg-green-100"
        } text-2xl`}
      >
        {status === "loading" ? (
          <AiFillCloseCircle color={"#ca8a04"} />
        ) : status === "failed" ? (
          <FaTimesCircle color="red" />
        ) : (
          <BsFillCheckCircleFill color={"#15803d"} />
        )}
      </span>
      <p className="text-xl text-slate-700 dark:text-white">
        {status === "complete"
          ? "Payment Success!"
          : status === "loading"
          ? "Payment Pending!"
          : "Payment Failed!"}
      </p>
      <span className="text-[0.9rem] text-slate-600 text-center dark:text-gray-200">
        {status === "loading"
          ? "Processing your payment."
          : status === "failed"
          ? "Could not complete payment"
          : "Your payment has been successfully done."}
      </span>
      {/* D-[2] */}
      <div className="w-full mt-3 p-2 bg-gray-100 flex flex-col gap-2 text-slate-700 dark:bg-slate-700 dark:text-gray-200 rounded-md">
        <div className="w-full flex items-center justify-between">
          <span className="text-[0.9rem]">Amount</span>
          <h2 className="text-base">{naira}</h2>
        </div>
        <div className="w-full flex items-center justify-between">
          <span className="text-[0.9rem]">Payment status</span>
          {/* @ts-ignore */}
          <Chip
            varient={
              status === "loading"
                ? "warning"
                : status === "failed"
                ? "error"
                : "success"
            }
            text={status}
          />
        </div>
        <hr />
        <div className="w-full flex flex-col gap-2">
          {receiptDetails.map((r) => (
            <div
              key={r.id}
              className="w-full flex items-center justify-between"
            >
              <span>{r.desc}</span>
              <h2 className="font-semibold">{r.prop}</h2>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full flex flex-col gap-2">
        <Button
          className="h-[2.5rem] px-3"
          name="Download PDF reciept"
          disabled={false}
          varient="outlined"
          onClick={() => {}}
          borderRadius={true}
        />
        <Button
          className="h-[2.5rem] px-3"
          name="Done"
          disabled={false}
          varient="filled"
          onClick={() => {}}
          borderRadius={true}
        />
      </div>
    </div>
  );
};

export default Receipt;
