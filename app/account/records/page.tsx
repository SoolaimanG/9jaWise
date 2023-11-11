"use client";

//---------------------->All Imports<---------------------
import { useNairaFormatter } from "@/Hooks/useNairaFormatter";
import { historyProps } from "@/Models/user";
import EmptyState from "@/components/Account/emptyState";
import History_comp from "@/components/Account/history_comp";
import FadeIn from "@/components/Animations/fadeIn";
import Input from "@/components/input";
import { SelectOption } from "@/components/selectOptions";
import { useStore } from "@/provider";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

//---------------->ItemType<--------------
export type item_type = {
  name: "all" | "credit" | "debit";
};
const items: item_type[] = [
  {
    name: "all",
  },
  {
    name: "credit",
  },
  {
    name: "debit",
  },
];

const Page = () => {
  //----------->Zustand Provider <------------
  const { is_darkmode, user } = useStore();

  const params = useSearchParams(); //Use search params here when the user decided to view transaction for notification

  //--->Using this states to filter through history<---
  const [user_history, set_User_history] = useState<historyProps[]>();
  const [search, setSearch] = useState<string | number>(
    (params.get("search") as string) ? (params.get("search") as string) : ""
  );

  // Total Money In
  const money_in = user?.history
    ?.filter((history) => {
      return history.type === "credit";
    })
    .reduce((acc, curr) => {
      return acc + curr.amount;
    }, 0);

  // Total Money Out
  const money_out = user?.history
    ?.filter((history) => {
      return history.type === "debit";
    })
    .reduce((acc, curr) => {
      return acc + curr.amount;
    }, 0);

  //Using this to show Money In and Money Out
  const history_details = (amount: number, type: "Money In" | "Money Out") => {
    const naira = useNairaFormatter(amount || 0);
    return (
      <div
        className={`w-fit cursor-pointer px-2 py-1 rounded-sm flex items-center gap-2 ${
          is_darkmode ? "cardGlassmorphism_dark" : "cardGlassmorphism_light"
        }`}
      >
        <span className="wordGradient md:text-base text-lg sm:text-[1rem] font-semibold">
          {type}:
        </span>
        <p
          className={` text-2xl md:text-lg sm:text-base ${
            type === "Money In" ? "text-green-600" : "text-red-600"
          } `}
        >
          {naira}
        </p>
      </div>
    );
  };

  //Using this to filter between Credit | Debit | All using switch case -->
  const filter_history = (type: "all" | "credit" | "debit") => {
    //
    switch (type) {
      case "all":
        const filterAll = user?.history?.filter((history) => {
          return history.type !== "airtime";
        });
        set_User_history(filterAll as historyProps[]);
        break;
      case "credit":
        const filterCredit = user?.history?.filter((history) => {
          return history.type === "credit";
        });
        set_User_history(filterCredit as historyProps[]);
        break;
      case "debit":
        const filterDebit = user?.history?.filter((history) => {
          return history.type === "debit";
        });
        set_User_history(filterDebit as historyProps[]);
        break;
      default:
        break;
    }
  };

  //Search by transaction ID and Name
  const search_transaction = () => {
    //Search Transaction By Transaction ID
    const find_by_refID = user?.history.filter((history) => {
      return history.refID
        .trim()
        .toLowerCase()
        .includes(search.toString().trim().toLowerCase());
    });

    //Search Transaction By the name
    const find_by_name = user?.history.filter((history) => {
      return history.name
        .toLowerCase()
        .trim()
        .includes(search.toString().toLowerCase().trim());
    });

    set_User_history(
      (find_by_name?.length as number) >= 1
        ? (find_by_name as historyProps[])
        : (find_by_refID as historyProps[])
    );
  };

  //Trigger the search function whenever the search is changing and on user change
  useEffect(() => {
    search_transaction();
  }, [search, user]);

  //Set the user history when the component mount or user changes from null to user Properties
  useEffect(() => {
    user && set_User_history(user.history);
  }, [user]);

  return (
    <FadeIn className="w-full mt-5 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {history_details(money_in as number, "Money In")}
        {history_details(money_out as number, "Money Out")}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={search}
          setValue={setSearch}
          type="text"
          placeholder="Search transaction by Name or TransactionID"
        />
        {/* Trigger Type of filters user wants */}
        <SelectOption
          title="Filter By"
          className="w-[30%] md:w-[35%] sm:w-[40%]"
          label="Filter"
          items={items}
          action={filter_history}
        />
      </div>
      {(user_history?.length as number) <= 0 ? (
        <EmptyState message="No transaction here" /> //Is the user history is empty
      ) : (
        <div className="w-full bg-gray-100 rounded-md dark:bg-slate-900 p-1">
          {user_history
            ?.sort((a, b) => b.date - a.date)
            ?.map((history, i) => (
              <History_comp key={i} {...history} />
            ))}
        </div>
      )}
    </FadeIn>
  );
};

export default Page;
