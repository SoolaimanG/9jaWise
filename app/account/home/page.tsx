import Accessibility from "@/components/Account/accessibility";
import History from "@/components/Account/history";
import VerificationIncomplete from "@/components/Account/verificationIncomplete";
import Chart from "@/components/chart";
import React from "react";

const Page = async () => {
  return (
    <div className="w-full pb-5 flex flex-col gap-3 h-full">
      <VerificationIncomplete />
      <div className="w-full p-2 mt-5 rounded-md dark:bg-slate-900 bg-gray-100 hidden md:block sm:block ">
        <Accessibility />
      </div>
      <Chart
        thisWeek={[
          {
            day: "Sun",
            amount: 100,
          },
          {
            day: "Mon",
            amount: 10000,
          },
          {
            day: "Tue",
            amount: 500,
          },
          {
            day: "Wed",
            amount: 6000,
          },
          {
            day: "Thu",
            amount: 200,
          },
          {
            day: "Fri",
            amount: 500,
          },
          {
            day: "Sat",
            amount: 400,
          },
        ]}
      />
      <History />
    </div>
  );
};

export default Page;
