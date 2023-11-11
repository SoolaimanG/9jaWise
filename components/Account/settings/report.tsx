import { useNairaFormatter } from "@/Hooks/useNairaFormatter";
import { format } from "date-fns";
import { useStore } from "@/provider";
import React, { useState } from "react";
import { DatePicker } from "@/components/datePicker";
import SlideFromBelow from "@/components/Animations/slideFromBelow";
import DownloadPDF from "./downloadPDF";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";
//import Button from "@/components/button";

const Report = () => {
  const { user } = useStore();

  const money = useNairaFormatter(user?.logs.lastTransaction.amount as number);

  const [date, setDate] = useState<Date | undefined>();
  const [show_calender, setShow_calender] = useState<boolean>(false);

  return (
    <SlideFromBelow className="w-full flex flex-col gap-3">
      <div className="flex flex-col">
        <p className="text-xl">Get report on your account</p>
        <span className="text-gray-400 dark:text-gray-300">
          See what has been happening with your account.
        </span>
      </div>
      <div className="flex flex-col gap-3 mt-5">
        <div className="w-full flex items-center justify-between">
          <p className="text-lg">Last Login</p>
          <span>{format(user?.logs.lastLogin || 0, "PPP")}</span>
        </div>
        <div className="w-full flex items-center justify-between">
          <p className="text-lg">Last Transaction</p>
          <span
            className={`${
              user?.logs.lastTransaction.tran_type === "credit"
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {money}
          </span>
        </div>
        <div className="w-full flex items-center justify-between">
          <p className="text-lg">Total Email(s) sent</p>
          <span>{user?.logs.totalEmailSent}</span>
        </div>
        <div className="w-full flex items-center justify-between">
          <p className="text-lg">Suspicious login</p>
          <span
            className={`${
              user?.suspisiousLogin ? "text-red-500" : "text-green-500"
            }`}
          >
            {user?.suspisiousLogin ? "Detects usual login" : "Account is safe"}
          </span>
        </div>
        <div className="w-full flex mt-3 flex-col gap-1">
          <p className="text-lg">Download PDF</p>
          <div className="flex items-center w-full justify-between">
            <div className="w-[60%] relative">
              <Button
                //onBlur={() => setShow_calender(false)}
                onClick={() => setShow_calender((prev) => !prev)}
                variant="secondary"
                className="w-full h-[2.5rem]"
              >
                {date
                  ? format(new Date(date).getTime(), "PPP")
                  : "Pick a dead line"}
              </Button>
              {show_calender && (
                <div className="absolute w-full dark:bg-slate-900 bg-gray-100 bottom-0 right-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    onDayClick={() => setShow_calender(false)}
                    initialFocus
                  />
                </div>
              )}
            </div>
            <DownloadPDF date={date as Date} />
          </div>
        </div>
      </div>
    </SlideFromBelow>
  );
};

export default Report;
