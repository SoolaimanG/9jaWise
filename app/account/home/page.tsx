"use client";
import { historyProps } from "@/Models/user";
//--------------------->All Imports<-----------------------
import Accessibility from "@/components/Account/accessibility";
import History from "@/components/Account/history";
import VerificationIncomplete from "@/components/Account/verificationIncomplete";
import Chart from "@/components/chart";
import { useStore } from "@/provider";

//Ref to https://openai.chat.com -->Generate this to tell the week
const getWeekNumber = (d: Date): number => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDay() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
  return weekNumber;
};

const Page = () => {
  const { user } = useStore();

  const current_time = new Date(); // Current date and time

  const transactions: historyProps[] | undefined = user?.history.filter(
    (trans) => {
      const transDate = new Date(trans.date);

      // Calculate the start and end dates of the current week
      const currentWeekStart = new Date(current_time);
      currentWeekStart.setUTCDate(
        current_time.getUTCDate() - current_time.getUTCDay()
      ); // Start of the week (Sunday)
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setUTCDate(currentWeekStart.getUTCDate() + 6); // End of the week (Saturday)

      // Check if the transaction date is within the current week
      const isSameYear = current_time.getFullYear() === transDate.getFullYear();
      const isSameMonth = current_time.getMonth() === transDate.getMonth();
      const isSameWeek =
        getWeekNumber(current_time) === getWeekNumber(transDate);

      return isSameYear && isSameMonth && isSameWeek;
    }
  );

  //An object to calculate all the total transaction(s) either debit or credit of a specific date from SUNDAY - SATURDAY
  const all_transactions = {
    sun: transactions
      ?.filter((transaction) => new Date(transaction.date).getDay() === 0)
      .reduce((acc, curr) => acc + curr.amount, 0),
    mon: transactions
      ?.filter((transaction) => new Date(transaction.date).getDay() === 1)
      .reduce((acc, curr) => acc + curr.amount, 0),
    tue: transactions
      ?.filter((transaction) => new Date(transaction.date).getDay() === 2)
      .reduce((acc, curr) => acc + curr.amount, 0),
    wed: transactions
      ?.filter((transaction) => new Date(transaction.date).getDay() === 3)
      .reduce((acc, curr) => acc + curr.amount, 0),
    thu: transactions
      ?.filter((transaction) => new Date(transaction.date).getDay() === 4)
      .reduce((acc, curr) => acc + curr.amount, 0),
    fri: transactions
      ?.filter((transaction) => new Date(transaction.date).getDay() === 5)
      .reduce((acc, curr) => acc + curr.amount, 0),
    sat: transactions
      ?.filter((transaction) => new Date(transaction.date).getDay() === 6)
      .reduce((acc, curr) => acc + curr.amount, 0),
  };

  return (
    <div className="w-full flex flex-col gap-2 h-full">
      <VerificationIncomplete />
      <div className="w-full p-2 mt-5 rounded-md dark:bg-slate-900 bg-gray-100 hidden md:block sm:block ">
        <Accessibility />
      </div>
      <Chart
        thisWeek={[
          {
            day: "Sun",
            amount: all_transactions.sun || 0,
          },
          {
            day: "Mon",
            amount: all_transactions.mon || 0,
          },
          {
            day: "Tue",
            amount: all_transactions.tue || 0,
          },
          {
            day: "Wed",
            amount: all_transactions.wed || 0,
          },
          {
            day: "Thu",
            amount: all_transactions.thu || 0,
          },
          {
            day: "Fri",
            amount: all_transactions.fri || 0,
          },
          {
            day: "Sat",
            amount: all_transactions.sat || 0,
          },
        ]}
      />
      <History />
    </div>
  );
};

export default Page;
