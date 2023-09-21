import { BsFillCheckCircleFill } from "react-icons/bs";
import { AiFillCloseCircle } from "react-icons/ai";
import Chip from "./chip";
import Button from "./button";

export type receiptProps = {
  status: "success" | "pending";
  amount: number;
  refNumber: number;
  receiver: string;
  sender: string;
  payment_method: "trf" | "card";
  payment_time: number;
};

const Receipt = (props: receiptProps) => {
  const {
    status,
    amount,
    receiver,
    refNumber,
    sender,
    payment_method,
    payment_time,
  } = props;
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
      desc: "Payment method",
      prop: payment_method,
    },
    {
      id: 1,
      desc: "Payment time",
      prop: payment_time,
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
          status === "pending" ? "bg-yellow-100" : "bg-green-100"
        } text-2xl`}
      >
        {status === "pending" ? (
          <AiFillCloseCircle color={"#ca8a04"} />
        ) : (
          <BsFillCheckCircleFill color={"#15803d"} />
        )}
      </span>
      <p className="text-xl text-slate-700 dark:text-white">Payment Success!</p>
      <span className="text-[0.9rem] text-slate-600 text-center dark:text-gray-200">
        {status === "pending"
          ? "Processing your payment."
          : "Your payment has been successfully done."}
      </span>
      {/* D-[2] */}
      <div className="w-full mt-3 p-2 bg-gray-100 flex flex-col gap-2 text-slate-700 dark:bg-slate-700 dark:text-gray-200 rounded-md">
        <div className="w-full flex items-center justify-between">
          <span className="text-[0.9rem]">Amount</span>
          <h2 className="text-xl font-semibold">{amount}</h2>
        </div>
        <div className="w-full flex items-center justify-between">
          <span className="text-[0.9rem]">Payment status</span>
          {/* @ts-ignore */}
          <Chip
            varient={status === "pending" ? "warning" : "success"}
            text={status === "pending" ? "processing" : "uccess"}
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
          name="Download PDF reciept"
          disabled={false}
          varient="outlined"
          width="full"
          onClick={() => {}}
          borderRadius={true}
        />
        <Button
          name="Done"
          disabled={false}
          varient="filled"
          width="full"
          onClick={() => {}}
          borderRadius={true}
        />
      </div>
    </div>
  );
};

export default Receipt;
