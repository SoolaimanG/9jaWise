"use client";

import { historyProps, notificationsProps } from "@/Models/user";
import FadeIn from "../Animations/fadeIn";
import Button from "../button";
import History_comp from "./history_comp";
import EmptyState from "./emptyState";
import SheetComp from "../sheet";
import { useStore } from "@/provider";

const test_history: historyProps[] = [
  {
    type: "credit",
    amount: 1000,
    date: new Date("2017").getTime(),
    name: "Soolaiman",
    refID: "1",
    status: "complete",
  },
  {
    type: "debit",
    amount: 500,
    date: new Date("2018").getTime(),
    name: "Nazman",
    refID: "2",
    status: "failed",
  },
  {
    type: "airtime",
    amount: 200,
    date: new Date("2018").getTime(),
    name: "Nazman",
    refID: "3",
    status: "failed",
  },
  {
    type: "bill payments",
    amount: 500,
    date: new Date("2018").getTime(),
    name: "Nazman",
    refID: "4",
    status: "failed",
  },
  {
    type: "credit",
    amount: 2000,
    date: new Date("2023 03 16").getTime(),
    name: "Soolaiman",
    refID: "5",
    status: "complete",
  },
];

const History = () => {
  const { user } = useStore();

  return (
    <FadeIn className="w-full mt-2 rounded-md dark:bg-slate-900 bg-gray-100">
      <p className="text-2xl p-2 wordGradient">Latest Transaction History</p>
      <div className="w-full flex mt-3 md:overflow-auto sm:overflow-auto flex-col gap-2">
        {(user?.history.length as number) <= 0 ? (
          <EmptyState message="No recent transactions" />
        ) : (
          user?.history.slice(0, 11).map((h, i) => (
            <History_comp
              key={i}
              name={h.name}
              amount={h.amount}
              date={h.date}
              //@ts-ignore
              type={h.type}
              status={h.status}
              refID={h.refID}
            />
          ))
        )}
        {(user?.history.length as number) > 10 && (
          <Button
            className="h-[2.5rem] mt-2 w-full"
            name="View All Transactions"
            disabled={false}
            varient="filled"
            onClick={() => {}}
          />
        )}
      </div>
    </FadeIn>
  );
};

export default History;
