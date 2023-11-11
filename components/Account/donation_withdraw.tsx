//---------------------->All Imports<---------------------
import React, { useState } from "react";
import Input from "../input";
import { DialogAlert } from "../dialogAlert";
import Button from "../button";
import Ask_authentication from "./ask_authentication";
import { donationProps, useStore } from "@/provider";
import { DialogClose } from "@radix-ui/react-dialog";
import { useNairaFormatter } from "@/Hooks/useNairaFormatter";
import { toast } from "../ui/use-toast";

type withdraw_donation_props = {
  donation: donationProps;
};

const Donation_withdraw = ({ donation }: withdraw_donation_props) => {
  const [loading, setLoading] = useState(false); //Track request

  //---------->Payload needed to withdraw<-----------
  const [amount, setAmount] = useState<string | number>("");
  const [password_or_otp, setPassword_or_otp] = useState<string | number>("");

  const { user, try_refresh } = useStore(); //user properties and hard requesh
  const r = useNairaFormatter(donation.amount_raised); //Format the amount to NAIRA

  //Function to withdraw from the donation choose
  const withdraw_from_donations = async () => {
    setLoading(true);

    //Payload needed to withdraw from the donation
    const payload = {
      withdraw_amount: amount,
      donation_id: donation.id,
      password_or_otp: password_or_otp,
    };

    //Sending request to http://localhost:8080/api/donation/withdraw to withdraw amount
    const res = await fetch("/api/donation/withdraw", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    //The request was !OK
    if (!res.ok) {
      setLoading(false);
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText,
        variant: "destructive",
      });
      return;
    }

    //Notify the user that the request is successful and perform hard refresh
    try_refresh();
    setLoading(false);
    toast({
      title: "SUCCESS",
      description: res.statusText,
    });
  };

  return (
    <DialogAlert
      button={
        <Button
          className="w-full h-[2.5rem]"
          name="Withdraw"
          borderRadius
          disabled={false}
          varient="filled"
          onClick={() => {}}
        />
      }
      title="Want to make a withdraw?"
      description="Input the amount you want to withdraw from your donations."
      content={
        <div className="w-full flex flex-col gap-3">
          <Input
            value={amount}
            setValue={setAmount}
            type="number"
            placeholder="Amount to withdraw"
          />
          {user?.settings.send_otp_for_each_transaction && (
            <Ask_authentication
              value={password_or_otp}
              setValue={setPassword_or_otp}
            />
          )}
          <p className="text-base text-purple-400">
            Available Donation Amount:{" "}
            <strong className="text-xl sm:text-[0.9rem]">{r}</strong>
          </p>
          <div className="flex items-center gap-2">
            <DialogClose className="w-full h-[2.5rem] rounded-md border border-purple-500">
              Cancel
            </DialogClose>
            <Button
              borderRadius
              name="Confirm"
              varient="filled"
              disabled={
                donation.amount_raised > Number(amount) && !loading && amount
                  ? false
                  : true
              }
              states={loading ? "loading" : undefined}
              onClick={withdraw_from_donations}
              className="w-full h-[2.5rem]"
            />
          </div>
        </div>
      }
    />
  );
};

export default Donation_withdraw;
