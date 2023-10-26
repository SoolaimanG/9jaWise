import { useNairaFormatter } from "@/Hooks/useNairaFormatter";
import React from "react";
import { useFormatDate } from "../../Hooks/useFormatDate";

export type billsProps = {
  type: "bill";
  amount: number;
  billMessage: string;
  paymentFor: string | number;
  time: number;
};

const BillsNotification = (props: billsProps) => {
  const { type, amount, billMessage, paymentFor, time } = props;
  const naira = useNairaFormatter(amount);
  const date = useFormatDate(time);
  return (
    <div className="w-full dark:bg-slate-700 dark:text-gray-300 text-gray-500 bg-gray-100 rounded-md flex flex-col gap-3 h-fit p-2">
      <div>
        <p className="text-[1rem]">Bill payment</p>
      </div>
      <div className="w-full flex flex-col gap-1 items-center justify-center">
        <p className={``}>Success</p>
        <p className={`text-2xl text-red-500 font-semibold`}>{naira}</p>
      </div>
      <p className="flex gap-2 items-center text-[0.9rem]">{billMessage}</p>
      <hr />
      <div className="w-full flex items-center justify-between">
        <p>{date}</p>
        <button>view</button>
      </div>
    </div>
  );
};

export default BillsNotification;
