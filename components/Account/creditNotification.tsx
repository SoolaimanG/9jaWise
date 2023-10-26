import React from "react";
import { statusProps } from "../loaders";
import { useNairaFormatter } from "@/Hooks/useNairaFormatter";
import { useFormatDate } from "../../Hooks/useFormatDate";

export type creditnotification = {
  status: "credit" | "debit";
  amount: number;
  acct: number;
  time: string | number;
  id: string;
};

const CreditNotification = (props: creditnotification) => {
  const { amount, acct, time, id, status } = props;
  const naira = useNairaFormatter(amount);
  const date = useFormatDate(time);

  return (
    <div className="w-full dark:bg-slate-700 dark:text-gray-300 text-gray-500 bg-gray-100 rounded-md flex flex-col gap-3 h-fit p-2">
      <div>
        <p className="text-[1rem]">
          {status === "credit" ? "Credit notification" : "Debit notification"}
        </p>
      </div>
      <div className="w-full flex flex-col gap-1 items-center justify-center">
        <p
          className={`${
            status === "credit" ? "text-green-500" : "text-red-500"
          }`}
        >
          Success
        </p>
        <p
          className={`text-2xl ${
            status === "credit" ? "text-purple-700" : "text-red-600"
          } font-semibold`}
        >
          {naira}
        </p>
      </div>
      <p className="flex gap-2 items-center text-[0.9rem]">
        {status === "credit" ? "Sender's Account:" : "Receiver's Account"}{" "}
        <strong className="text-[1.1rem]">{acct}</strong>
      </p>
      <hr />
      <div className="w-full flex items-center justify-between">
        <p>{date}</p>
        <button>view</button>
      </div>
    </div>
  );
};

export default CreditNotification;
