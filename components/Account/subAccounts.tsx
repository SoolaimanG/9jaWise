import React, { useState } from "react";
//--------------->All Imports<------------------
import Chip from "../chip";
import { useNairaFormatter } from "@/Hooks/useNairaFormatter";
import Button from "../button";
import { toast } from "../ui/use-toast";
import { addStatusMessage } from "./data";
import { useStore } from "@/provider";

export type subaccountTypes = {
  id: string; //Unique identifier
  account_number: string; //Unique Account Number
  account_name: string; //Account Name
  state: "Active" | "Expired"; //Is it active or has expired
  amount_to_recieve: number; //Amount to receive
  is_received: boolean; //Have the account meet it's need? True or False
  payers_email: string; //Could be payer email or any email that is not yours
  created_at?: number; //Time account was created
  expires_at?: number; //Time account will be expiring
};

const SubAccounts = ({
  account_number,
  state,
  amount_to_recieve,
  is_received,
  payers_email,
  account_name,
  expires_at,
  id,
}: subaccountTypes) => {
  const naira = useNairaFormatter(amount_to_recieve); //USENAIRAFORMATTER ->A custom hook that format the amount to a Naira pattern using INT'L format

  const [loading, setLoading] = useState(false);

  const { try_refresh } = useStore();

  //A function that can reactive the sub account to life and carries out normal transaction
  const reactivate_subaccount = async () => {
    const has_expired = Date.now() < Number(expires_at);

    console.log(id);

    if (has_expired) {
      toast({
        title: `ERROR 400`,
        description: addStatusMessage(400),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    //
    const payload = {
      account_id: id,
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/generate_sub_account/regenerate`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      setLoading(false);
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText || addStatusMessage(res.status as 400),
        variant: "destructive",
      });
      return;
    }

    setLoading(false);
    toast({
      title: `SUCCESS`,
      description: res.statusText || addStatusMessage(res.status as 200),
    });

    try_refresh();
  };

  //Delete the subaccount created by the user
  const delete_subaccount = async () => {
    //
  };

  return (
    <div className="w-full h-fit p-2 cursor-pointer flex flex-col gap-2 dark:bg-slate-700 rounded-sm bg-white">
      <div className="flex items-center justify-between">
        <strong className="capitalize sm:text-[0.75rem]">
          {payers_email.length > 20
            ? payers_email.slice(0, 20) + "..."
            : payers_email}
        </strong>
        {is_received ? (
          <Chip
            className="sm:text-[0.8rem]"
            varient="success"
            text="Received"
          />
        ) : state === "Active" ? (
          <Chip className="sm:text-[0.8rem]" varient="warning" text="Pending" />
        ) : (
          <Chip className="sm:text-[0.8rem]" varient="error" text="Expired" />
        )}
      </div>
      <div className="flex items-center gap-1">
        <div
          className={`w-[8px] sm:h-[6px] h-[8px] sm:w-[6px] rounded-full ${
            state === "Active" ? "bg-green-600" : "bg-red-600"
          }`}
        />
        <span className="sm:text-[0.8rem]">{state}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-col">
          <p className=" flex sm:flex-col sm:text-base md:flex-col gap-1 text-base">
            Account Number:{" "}
            <span className=" sm:text-[0.85rem]">{account_number}</span>
          </p>
          <p className="capitalize sm:text-base flex sm:flex-col md:flex-col gap-1 text-base">
            Account Name:{" "}
            <span className=" sm:text-[0.85rem]">{account_name}</span>
          </p>
        </div>
        <p className="text-[1.5rem] sm:text-base font-semibold wordGradient">
          {naira}
        </p>
      </div>
      {Date.now() > Number(expires_at) && (
        <div className="w-full flex gap-2 items-center justify-end">
          <Button
            className="px-2"
            borderRadius
            name="Delete"
            disabled={!false}
            varient="danger"
            onClick={() => {}}
          />
          <Button
            className="px-2"
            borderRadius
            name="Reactivate"
            states={loading ? "loading" : undefined}
            disabled={true}
            varient="filled"
            onClick={() => {}}
          />
        </div>
      )}
    </div>
  );
};

export default SubAccounts;
