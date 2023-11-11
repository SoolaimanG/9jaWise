"use client";
//---------->All Imports<----------
import FadeIn from "../Animations/fadeIn";
import History_comp from "./history_comp";
import EmptyState from "./emptyState";
import { useStore } from "@/provider";
import Link from "next/link";

const History = () => {
  const { user } = useStore();

  return (
    <FadeIn className="w-full pb-5 rounded-md dark:bg-slate-900 bg-gray-100">
      <p className="text-2xl p-2 wordGradient">Latest Transaction History</p>
      <div className="w-full flex mt-3 md:overflow-auto sm:overflow-auto flex-col gap-2">
        {(user?.history.length as number) <= 0 ? (
          <EmptyState message="No recent transactions" />
        ) : (
          user?.history
            .slice(0, 11)
            .sort((a, b) => b.date - a.date)
            .map((h, i) => (
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
          <Link
            href={"/account/records"}
            className="underline text-center text-purple-500 text-base"
          >
            View all transaction
          </Link>
        )}
      </div>
    </FadeIn>
  );
};

export default History;
