"use client";

import React, { SetStateAction, useState } from "react";
import Input from "../input";
import Button from "../button";
import { useStore } from "@/provider";
import { toast } from "../ui/use-toast";

type Ask_authenticationProps = {
  value: string | number;
  setValue: React.Dispatch<SetStateAction<string | number>>;
};

const Ask_authentication = ({ value, setValue }: Ask_authenticationProps) => {
  const { user } = useStore();

  const [loading, setLoading] = useState(false);

  const request_otp = async () => {
    setLoading(true);

    const payload = {
      loginMode: user?.loginMode,
      email: user?.email,
    };

    if (!user?.email) {
      setLoading(false);
      toast({
        title: "ERROR",
        description: "Use Password instead",
        variant: "destructive",
      });
      return;
    }

    const res = await fetch("/api/auth/requestOTP", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setLoading(false);
      toast({
        title: "ERROR" + " " + String(res.status),
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
  };

  return (
    <div className="w-full flex sm:flex-col items-center gap-1">
      <Input
        placeholder="Input Password or OTP"
        value={value}
        setValue={setValue}
        type="text"
        disabled={loading}
      />
      <Button
        borderRadius
        className="w-[40%] h-[2.5rem] sm:w-full"
        name="Request OTP"
        disabled={false}
        states={loading ? "loading" : undefined}
        varient="filled"
        onClick={request_otp}
      />
    </div>
  );
};

export default Ask_authentication;
