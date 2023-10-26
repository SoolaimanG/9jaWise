"use client";

import { kyc_steps } from "@/Models/user";
import React from "react";
import ProgressComp from "../progress";
import ProgressBars from "../progressBars";
import Link from "next/link";
import FadeIn from "../Animations/fadeIn";
import { useStore } from "@/provider";

export type incompleteVerification = {
  email_verified: boolean;
  kyc_steps: kyc_steps[];
};

const VerificationIncomplete = () => {
  const { user } = useStore();

  const route = !user?.emailVerified
    ? "/auth/verify-email/id"
    : user?.kyc_steps.length === 0 || user?.kyc_steps.length === 1
    ? `/KYC/id/personal-details`
    : user?.kyc_steps.length === 2
    ? `/KYC/id/id-details`
    : `/KYC/id/bank-details`;

  return (
    <FadeIn className="w-full p-2 mt-5 rounded-md dark:bg-slate-900 bg-gray-100">
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
          value={user?.email_verified ? 40 : 0 + user?.kyc_steps?.length * 20}
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
              value={Math.abs(33.3333) * (user?.kyc_steps?.length || 0)}
            />
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default VerificationIncomplete;
