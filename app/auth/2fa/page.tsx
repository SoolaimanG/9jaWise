"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { toast } from "@/components/ui/use-toast";
import { Lock } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";

const Page = () => {
  // State to manage the entered OTP, loading state, and error state
  const [otp, setOtp] = useState<number | string>("");
  const [state, setState] = useState({
    loading: false,
    error: false,
  });

  // Get URL parameters using Next.js useSearchParams hook
  const params = useSearchParams();

  // Function to authenticate the user
  const authenticate_user = async () => {
    // Check if required parameters are present in the URL
    if (!params.has("loginId") || !params.has("password")) {
      toast({
        title: `ERROR 400`,
        description: "Authentication Failed",
        variant: "destructive",
      });
      return;
    }

    // Set loading state to true while authentication is in progress
    setState({ ...state, loading: true });

    // Extract loginID and password from URL parameters
    const loginID = params.get("loginID");
    const password = params.get("password");

    // Attempt to sign in with provided credentials and OTP
    const res = await signIn("credentials", {
      redirect: false,
      loginID: loginID,
      otp: otp,
      password: password,
    });

    // Handle authentication errors
    if (res?.error) {
      setState({ ...state, loading: false, error: true });
      toast({
        title: `ERROR 400`,
        description: res.error,
        variant: "destructive",
      });
      return;
    }

    // Authentication successful, update state and display success toast
    setState({ ...state, loading: false, error: false });
    toast({
      title: "SUCCESS",
      description: "Authentication successful",
    });
  };

  // Render the Two Factor Authentication page
  return (
    <div className="w-full h-full p-3 flex flex-col gap-3 items-center justify-center">
      <span className="p-3 rounded-full bg-purple-50">
        <Lock size={50} className="text-purple-700" />
      </span>
      <div className="flex w-full justify-start flex-col gap-1">
        <p className="text-xl text-purple-400">Two Factor Authentication</p>
        <span className="text-base">
          You are seeing this because 2FA is enabled for this account
        </span>
      </div>
      <Input
        value={otp}
        setValue={setOtp}
        error={state.error}
        type="text"
        placeholder="6-digit code"
      />
      <Button
        className="w-full h-[2.5rem]"
        name="Authenticate"
        states={state.loading ? "loading" : undefined}
        disabled={String(otp).length === 6 && !state.loading ? false : true}
        varient="filled"
        onClick={authenticate_user}
        borderRadius
      />
    </div>
  );
};

export default Page;
