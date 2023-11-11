"use client";

import { kyc_steps } from "@/Models/user";
import React from "react";
import ProgressComp from "../progress";
import ProgressBars from "../progressBars";
import Link from "next/link";
import FadeIn from "../Animations/fadeIn";
import { useStore } from "@/provider";

const VerificationIncomplete = () => {
  const { user } = useStore(); //User Properties From Zustand State

  //Using this checks to know where to route to base on the user KYC status
  const route = !user?.emailVerified
    ? `/auth/verify-email/`
    : user?.kyc_steps.length === 0 || user?.kyc_steps.length === 1
    ? `/KYC/personal-details`
    : user?.kyc_steps.length === 2
    ? `/KYC/id-details`
    : `/KYC/bank-details`;

  const email_verified = user?.emailVerified ? 40 : 0; //Email Verified Alone has a score of 40 in the KYC progress

  return (
    <FadeIn className="w-full px-2 py-5 sm:py-3 mt-5 rounded-md dark:bg-slate-900 bg-gray-100">
      <div className="text-lg w-full flex items-center justify-between text-left dark:text-gray-300 text-gray-500">
        <p className="sm:text-[1.1rem]">
          Your Verification is not yet completed
        </p>
        <Link
          href={route}
          className="w-fit border border-gray-300 rounded-md sm:px-[3px] sm:py-[2px] px-3 py-1 hover:dark:bg-slate-700 hover:bg-white"
        >
          Continue
        </Link>
      </div>
      <div className="mt-3 flex w-full items-center gap-4">
        <ProgressBars
          width={"60px"}
          //@ts-ignore
          value={email_verified + user?.kyc_steps?.length * 20}
        />
        <div className="flex w-full flex-col gap-1">
          <label className="flex text-lg sm:flex-col text-gray-500 gap-1 dark:text-gray-300">
            Email Verification:
            <span
              className={`${
                user?.emailVerified ? "text-green-500" : "text-red-500"
              } text-[1.1rem]`}
            >
              {user?.emailVerified ? "Verified" : "Not Verified"}
            </span>
          </label>
          <div className="flex w-full flex-col">
            <p className="text-gray-500 text-lg dark:text-gray-300">
              KYC Verification
            </p>
            <ProgressComp
              //(100/3)--> 33.3333 then we multiply with the length of kyc steps
              value={Math.abs(33.3333) * (user?.kyc_steps?.length || 0)}
            />
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default VerificationIncomplete;
