import React from "react";
import Donation_withdraw from "./donation_withdraw";
import Donation_delete from "./donation_delete";
import ProgressComp from "../progress";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import { SheetClose } from "../ui/sheet";
import { CgArrowLongLeft } from "react-icons/cg";
import SheetComp from "../sheet";
import { useNairaFormatter } from "@/Hooks/useNairaFormatter";
import EmptyState from "./emptyState";
import { useStore } from "@/provider";
import Donation_edit from "./donation_edit";

const Donation_content = () => {
  const { is_darkmode, user } = useStore(); //Are we on dark mode? or user properties

  return (
    <div className="w-full mt-5">
      {(user?.donation_campaigns.length as number) <= 0 ||
      !user?.donation_campaigns ? (
        <EmptyState message="No donation link created" />
      ) : (
        <div className="w-full cursor-pointer flex flex-col gap-5">
          {user?.donation_campaigns.map((d) => {
            const n = useNairaFormatter(d.target_amount);
            const r = useNairaFormatter(d.amount_raised);
            return (
              <div
                key={d.id}
                className={`w-full rounded-sm flex-col gap-1 -mt-2 ${
                  is_darkmode ? "cardGlassmorphism_dark" : "bg-white"
                } flex p-2`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-purple-600 text-2xl font-semibold">
                    {d.donation_name.length > 20
                      ? d.donation_name.slice(0, 20) + "..."
                      : d.donation_name}
                  </p>
                  <strong className="text-purple-500 wordGradient">{n}</strong>
                </div>
                <span className="text-base sm:text-[0.7rem] break-words">
                  {d.donation_link}
                </span>
                <ProgressComp max={d.target_amount} value={d.amount_raised} />
                <p
                  className={`text-base ${
                    d.target_amount / 2 > d.amount_raised
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {d.amount_raised.toString() +
                    "/" +
                    d.target_amount.toString()}
                </p>
                <div className="w-full flex gap-3">
                  <Donation_edit {...d} />

                  <SheetComp
                    button={
                      <button className=" underline text-base">View</button>
                    }
                    header={
                      <div
                        className={`w-full sticky top-0 ${
                          is_darkmode ? "heroGlassmorphism" : "navGlassmorphism"
                        } p-2 flex items-center`}
                      >
                        <SheetClose className="text-white">
                          <CgArrowLongLeft size={20} />
                        </SheetClose>
                        <p className="w-full font-semibold text-purple-500 text-xl sm:text-lg flex items-center justify-center">
                          {d.donation_name}
                        </p>
                      </div>
                    }
                  >
                    <div className="w-full h-full flex flex-col gap-3 p-2">
                      <div className="w-full flex items-center gap-2">
                        <span className="w-[3.5rem] flex items-center justify-center h-[3.5rem] rounded-full text-white gradient-one">
                          <FaRegMoneyBillAlt size={30} />
                        </span>
                        <div className="flex flex-col gap-1">
                          <p className="text-xl">Target Amount</p>
                          <span className="wordGradient">{n}</span>
                        </div>
                      </div>
                      <div className="w-full flex items-center justify-between">
                        <p className="text-base text-gray-400 dark:text-gray-100 sm:text-lg">
                          Amount raised
                        </p>
                        <p className="text-xl">{r}</p>
                      </div>
                      <div className="w-full flex flex-col gap-1">
                        <p className="text-xl font-semibold sm:text-lg">
                          Description
                        </p>
                        <p className="dark:text-gray-300 text-gray-500">
                          {d.description}
                        </p>
                      </div>
                      <div className="w-full p-2 flex flex-col gap-2 rounded-md bg-gray-50 dark:bg-slate-900">
                        <div className="w-full flex items-center justify-between">
                          <p className="text-base">Donation raised</p>
                          <span className="text-xl text-red-500">{r}</span>
                        </div>
                        <ProgressComp
                          max={d.target_amount}
                          value={d.amount_raised}
                        />
                      </div>
                      <div className="w-full flex flex-col gap-2">
                        <p className="text-gray-500 dark:text-gray-200">
                          Account Number:{" "}
                          <strong>{d.donation_account.account_number}</strong>
                        </p>
                        <p className="text-gray-500 dark:text-gray-200">
                          Account Name:{" "}
                          <strong className="capitalize">
                            {d.donation_account.account_name}
                          </strong>
                        </p>
                        <p className="text-gray-500 dark:text-gray-200">
                          Bank Name:{" "}
                          <strong>{d.donation_account.bank_name}</strong>
                        </p>
                      </div>
                      <p className="font-semibold text-gray-400 dark:text-gray-300">
                        {d.donators.length} people donated to this campaign
                      </p>
                      {d.donators.length >= 1 && (
                        <div className="w-full flex flex-col gap-2">
                          <p className="text-xl sm:text-lg">List of donators</p>
                          <div className="font-semibold flex flex-col gap-2 w-full">
                            {d.donators.map((_, i) => (
                              <div
                                key={i}
                                className="flex p-2 rounded-md items-center justify-between bg-gray-100 dark:bg-slate-900 w-full"
                              >
                                <p className="capitalize">{_.name}</p>
                                <p className="wordGradient">
                                  {useNairaFormatter(_.amount)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="w-full h-full flex flex-col items-end gap-2 justify-end">
                        <div className="w-full flex items-center gap-2">
                          {/* Delete donation component */}
                          <Donation_delete id={d.id} />
                          {/* Withdraw the donation availabe */}
                          <Donation_withdraw donation={d} />
                        </div>
                      </div>
                    </div>
                  </SheetComp>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Donation_content;
