"use client";

//------------------------>All Imports<------------------------
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

const Accessibility = () => {
  const { x } = useScreenSize(); //A custom hook for reading the screen size use client X and client Y coordinates
  const { user } = useStore(); //User Properties from Zustand State

  //Using this for the tabs of SEND | DEPOSIT and MORE
  const [quickAction, setQuickAction] = useState<"send" | "deposit" | "more">(
    "send"
  );

  return (
    <div className="w-full h-full overflow-auto">
      <div className="w-full p-2 flex flex-col gap-1 h-full">
        <SlideIn className="text-gray-500 text-lg dark:text-gray-300">
          My Card
        </SlideIn>
        <DebitCard
          hideBalance={user?.settings?.hidebalance}
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
              <QuickTrf />
            ) : quickAction === "deposit" ? (
              <Deposit
                accountName={String(user?.account.accountName)}
                accountNumber={String(user?.account.accountNumber)}
                bankName={String(user?.account.accountBank)}
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
