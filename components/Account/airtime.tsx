"use client";

import React, { useState } from "react";
import Input from "../input";
import { useStore } from "@/provider";
import Button from "../button";
import { beneficiariesProps, userProps } from "@/Models/user";
import Ask_authentication from "./ask_authentication";
import { toast } from "../ui/use-toast";

export type networkTypes = "mtn" | "glo" | "airtel" | "9mobile";

//Airtime dummy plans
const plans = [
  {
    amount: 50,
  },
  {
    amount: 100,
  },
  {
    amount: 200,
  },
  {
    amount: 300,
  },
  {
    amount: 500,
  },
  {
    amount: 1000,
  },
];
const airtimePlan = [
  {
    code: "MTN VTU",
    name: "MTN",
  },
  {
    code: "AIRTEL VTU",
    name: "AIRTEL",
  },
  {
    code: "GLO VTU",
    name: "GLO",
  },
  {
    code: "9MOBILE VTU",
    name: "9MOBILE",
  },
];

const Airtime = () => {
  const { is_darkmode, user, try_refresh } = useStore(); //Zustand States

  const { phoneNumber } = user as userProps<beneficiariesProps>; //get the user phoneNumber if available

  //-------->States needed to purchase Airtime<--------
  const [number, setNumber] = useState<string | number>(
    phoneNumber ? phoneNumber : ""
  );
  const [amount, setAmount] = useState<number | string>("");
  const [vtu, setVtu] = useState<"MTN" | "GLO" | "9MOBILE" | "AIRTEL">("MTN");
  const [otp_or_password, setOtp_or_password] = useState<string | number>("");

  //---------->Track states of request<--------
  const [loading, setLoading] = useState(false);

  //Async Fuction to buy airtime
  const buy_airtime = async () => {
    //------>Little Checks for Client<-------
    if ((user?.balance as number) < Number(amount)) {
      toast({
        title: `ERROR`,
        description: "Insufficient balance",
        variant: "destructive",
      });
      return;
    }
    if (user?.suspisiousLogin) {
      toast({
        title: `ERROR`,
        description: "Cannot perform this action right now",
        variant: "destructive",
      });
      return;
    }

    setLoading(true); //Start loading

    //payloads needed to perform operation
    const payload = {
      amount: amount,
      phone_number: number,
      network: vtu,
      otp_or_password: otp_or_password,
    };

    //http:localhost:8080/api/flutterwave/buy-airtime that's the full API
    const res = await fetch("/api/flutterwave/buy-airtime", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setLoading(false);
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText,
        variant: "destructive",
      });

      return;
    }

    setLoading(false);
    toast({
      title: "SUCCESS",
      description: res.statusText,
    });
    try_refresh(); //Hard refresh for new user updates
  };

  const plan = (
    <div className="w-full p-2 rounded-md dark:bg-slate-900 bg-gray-100 grid grid-cols-3 grid-rows-2 gap-3">
      {plans.map((plan) => (
        <div
          onClick={() => setAmount(plan.amount)}
          className={`flex flex-col items-center justify-center cursor-pointer rounded-md bg-gray-200 ${
            plan.amount === amount && "bg-purple-700 text-white"
          } hover:bg-purple-700 hover:text-white transition-all ease-linear delay-75 ${
            is_darkmode ? "glassmorph_darkmode" : " bg-gray-50"
          } p-1  gap-1`}
          key={plan.amount}
        >
          <strong className="flex gap-1 text-[1.1rem]">
            {plan.amount}
            <span className="flex flex-col items-end justify-end text-[0.9rem]">
              NGN
            </span>
          </strong>
          <p className="md:flex sm:items-center sm:flex-col sm:gap-1 md:items-center md:flex-col md:gap-1">
            Price{" "}
            <span className="text-[0.9rem]">
              {" "}
              {Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
              }).format(plan.amount)}
            </span>
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-3">
      <Input
        value={number}
        setValue={setNumber}
        error={false}
        disabled={false}
        type="text"
        placeholder="Enter Phone Number"
      />
      <div className="w-full flex gap-2">
        {airtimePlan.map((plan) => (
          <Button
            key={plan.name}
            className="w-full h-[2.5rem]"
            borderRadius={true}
            name={plan.name}
            varient={plan.name === vtu ? "filled" : "outlined"}
            //@ts-ignore
            onClick={() => setVtu(plan.name)}
            disabled={false}
          />
        ))}
      </div>
      {plan}
      <Input
        value={amount}
        setValue={setAmount}
        error={false}
        disabled={false}
        type="text"
        placeholder="Other Amount"
      />
      <Ask_authentication
        value={otp_or_password}
        setValue={setOtp_or_password}
      />
      <Button
        className="w-full h-[2.5rem]"
        borderRadius={true}
        states={loading ? "loading" : undefined}
        name="Buy Airtime"
        disabled={
          number.toString().length > 10 &&
          Number.isInteger(Number(number)) &&
          !loading &&
          amount
            ? false
            : true
        }
        varient="filled"
        onClick={buy_airtime}
      />
    </div>
  );
};

export default Airtime;
