"use client";

import React, { useState } from "react";
import DebitCard from "../debitCard";
import Button from "../button";
import { GoArrowDownLeft, GoArrowUpRight } from "react-icons/go";
import QuickTrf from "./quickTrf";
import Deposit from "./deposit";
import SlideFromBelow from "../Animations/slideFromBelow";
import FadeIn from "../Animations/fadeIn";
import SlideIn from "../Animations/slideIn";
import { CgMenuGridO } from "react-icons/cg";
import More from "./more";
import { useScreenSize } from "@/Hooks/useScreenSize";
import { useStore } from "@/provider";

const testData = [
  {
    accountNumber: "1234567890",
    accountName: "John Doe",
    bankName: "Zenith Bank",
  },
  {
    accountNumber: "9876543210",
    accountName: "Jane Smith",
    bankName: "Eco Bank",
  },
  {
    accountNumber: "5555555555",
    accountName: "Alice Johnson",
    bankName: "Wema Bank",
  },
  {
    accountNumber: "8888888888",
    accountName: "Bob Anderson",
    bankName: "Wema Bank",
  },
  {
    accountNumber: "7777777777",
    accountName: "Eve Wilson",
    bankName: "Access Bank",
  },
  {
    accountNumber: "9999999999",
    accountName: "Charlie Brown",
    bankName: "Opay",
  },
];

const Accessibility = () => {
  const [quickAction, setQuickAction] = useState<"send" | "deposit" | "more">(
    "send"
  );
  const { x } = useScreenSize();
  const { user } = useStore();

  return (
    <div className="w-full h-full overflow-auto">
      <div className="w-full p-2 flex flex-col gap-1 h-full">
        <SlideIn className="text-gray-500 text-lg dark:text-gray-300">
          My Card
        </SlideIn>
        <DebitCard
          className="w-full"
          accountNumber={user?.account.accountNumber as number | null}
          name={user?.account.accountName || (user?.username as string)}
          type="glassmorphism"
          balance={user?.balance as number}
        />
        <SlideIn className="text-gray-500 text-lg dark:text-gray-300">
          Quick Actions
        </SlideIn>
        <FadeIn className="w-full flex items-center gap-2">
          <Button
            className="h-[2.5rem] w-full"
            icon={<GoArrowDownLeft size={22} />}
            borderRadius={true}
            varient="filled"
            onClick={() => setQuickAction("deposit")}
            name={x > 290 ? "Deposit" : ""}
            disabled={false}
          />
          <Button
            className="h-[2.5rem] w-full"
            icon={<GoArrowUpRight size={22} />}
            borderRadius={true}
            varient="danger"
            onClick={() => setQuickAction("send")}
            name={x > 290 ? "Send" : ""}
            disabled={false}
          />
          <Button
            className="h-[2.5rem] w-full"
            icon={<CgMenuGridO size={22} />}
            borderRadius={true}
            varient="warning"
            onClick={() => setQuickAction("more")}
            name={x > 290 ? "More" : ""}
            disabled={false}
          />
        </FadeIn>
        <div className="w-full py-3 mt-3">
          <SlideFromBelow key={quickAction}>
            {quickAction === "send" ? (
              <QuickTrf beneficiaries={testData} />
            ) : quickAction === "deposit" ? (
              <Deposit
                accountName={user?.account.accountName as string}
                accountNumber={
                  user?.account.accountNumber?.toString() as string
                }
                bankName={user?.account.accountBank as string}
              />
            ) : (
              <More />
            )}
          </SlideFromBelow>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;
