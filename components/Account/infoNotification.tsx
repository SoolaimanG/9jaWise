import React from "react";
import { useFormatDate } from "../../Hooks/useFormatDate";
import Link from "next/link";

export type infoProps = {
  type: "info" | "email" | "warning";
  message: string;
  time: number;
  header: string;
};

const InfoNotification = (props: infoProps) => {
  const { time, type, message, header } = props;
  const date = useFormatDate(time);

  return (
    <div className="w-full dark:bg-slate-700 dark:text-gray-300 text-gray-500 bg-gray-100 rounded-md flex flex-col gap-3 h-fit p-2">
      <p
        className={`text-[1rem] font-semibold ${
          type === "email"
            ? "text-red-500"
            : type === "warning"
            ? " text-yellow-500"
            : " text-purple-500"
        }`}
      >
        {header}
      </p>
      <p>{message}</p>
      <hr />
      <div className="w-full flex items-center justify-between">
        <p>{date}</p>
        {type === "email" && (
          <Link className="underline" href={"/"}>
            Verify email
          </Link>
        )}
      </div>
    </div>
  );
};

export default InfoNotification;
