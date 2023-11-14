"use client";

//------------------>All Imports<----------------
import { useCheck } from "@/Hooks/useCheck";
import { useScreenSize } from "@/Hooks/useScreenSize";
import BulkAccounts from "@/components/Account/subAccounts";
import Donation from "@/components/Account/donation";
import EmptyState from "@/components/Account/emptyState";
import RequestPayment from "@/components/Account/requestPayment";
import FadeIn from "@/components/Animations/fadeIn";
import Button from "@/components/button";
import Input from "@/components/input";
import { toast } from "@/components/ui/use-toast";
import { useStore } from "@/provider";
import React, { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";

const Page = () => {
  //------------>States needed to create a new subaccount<---------
  const [payerEmail, setPayerEmail] = useState<string | number>("");
  const [amount, setAmount] = useState<string | number>("");

  const { try_refresh, user } = useStore(); //User properties and a hard refresh to updates the user_data property
  const { x } = useScreenSize(); //Hook for screen size
  const check_email = useCheck(payerEmail as string, "email"); //UseCheck a Hook for checking email | Passwords and ?:Username

  //------------->States for Tracking user request<-------------
  const [loading, setLoading] = useState(false);

  //A Async function use to send request to the server for creating a new subaccount
  const create_subaccount = async () => {
    setLoading(true); //Start loading which makes the button disabled

    //Payloads needed
    const payload = {
      amount_to_recieve: Number(amount),
      payers_email: payerEmail,
    };

    //Sending request to the API http://localhost:8080/api/generate_sub_account
    const res = await fetch("/api/generate_sub_account", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    //When the request is !OK notify the user and stop loading
    if (!res.ok) {
      setLoading(false);
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText,
        variant: "destructive",
      });
      return;
    }

    //If it's successful clear the form and notify the user that it's done
    setPayerEmail("");
    setAmount(0);
    setLoading(false);
    toast({
      title: "SUCCESS",
      description: res.statusText,
    });
    try_refresh(); //Hard refresh here
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Create a donation account and manage account created */}
      <Donation />
      {/* request payment from other 9JAWISE users */}
      <RequestPayment />
      <FadeIn className="w-full px-2 py-4 mt-2 rounded-md dark:bg-slate-900 bg-gray-100">
        <div className="w-full flex items-center justify-between">
          <p className="wordGradient text-xl md:text-lg sm:text-base font-semibold">
            Temporary Accounts
          </p>
          <Button
            name={x > 600 ? "Create Account" : ""}
            icon={<AiOutlinePlus />}
            varient="filled"
            states={loading ? "loading" : undefined}
            borderRadius
            disabled={
              check_email && Number(amount) > 0 && !loading ? false : true
            }
            onClick={create_subaccount}
            className="px-3 py-1 md:py-2"
          />
        </div>
        <div className="flex mt-3 flex-col gap-2">
          <Input
            value={payerEmail}
            setValue={setPayerEmail}
            type="text"
            error={payerEmail ? !check_email : false}
            placeholder="Payer's Email"
          />
          <Input
            value={amount}
            setValue={setAmount}
            type="number"
            placeholder="Amount to pay"
          />
        </div>

        <div className="flex mt-3 flex-col gap-2">
          {(user?.bulkAccountsCreated.length as number) >= 1 && (
            <p className="text-xl wordGradient sm:text-lg">
              Account(s) Created
            </p>
          )}
          {(user?.bulkAccountsCreated.length as number) <= 0 ? (
            <EmptyState message="No Account Avaiable" />
          ) : (
            user?.bulkAccountsCreated
              .sort(
                (a, b) => (b.created_at as number) - (a.created_at as number)
              )
              .map((sub, i) => <BulkAccounts {...sub} key={i} />)
          )}
        </div>
      </FadeIn>
    </div>
  );
};

export default Page;
