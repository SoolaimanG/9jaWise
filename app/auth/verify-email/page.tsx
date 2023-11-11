"use client";

// --------------> All Imports <--------------
import { useCheck } from "@/Hooks/useCheck";
import Button from "@/components/button";
import Input from "@/components/input";
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import SlideIn from "@/components/Animations/slideIn";
import Logo from "@/components/logo";
import SlideFromBelow from "@/components/Animations/slideFromBelow";
import { useStore } from "@/provider";

const Page = () => {
  // States to manage component state
  const [states, setStates] = useState({
    loading: false,
    verification_sent: false,
  });

  // useToast hook for displaying notifications
  const { toast } = useToast();
  // Next.js router
  const route = useRouter();
  //Zustand States
  const { try_refresh } = useStore();

  // States for email and OTP inputs
  const [email, setEmail] = useState<string | number>("");
  const [otp, setOtp] = useState<string | number>("");

  // Custom hook to check email format
  const confirm_email = useCheck(email as string, "email");

  // Function to request OTP
  const request_otp = async () => {
    setStates({ ...states, loading: true });
    const payload = {
      loginMode: "email",
      email: email as string,
    };

    const res = await fetch("/api/auth/requestOTP", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // Handle error cases
      setStates({
        ...states,
        loading: false,
        verification_sent: false,
      });

      toast({
        variant: "destructive",
        title: `ERROR ${res.status}`,
        description: res.statusText,
      });
      return;
    }

    // Display success message
    toast({
      title: "SUCCESS",
      description: res.statusText,
    });
    setStates({
      ...states,
      loading: false,
      verification_sent: true,
    });
  };

  // Function to verify OTP
  const verify_otp = async () => {
    const payload = {
      email: email as string,
      otp: otp,
    };

    setStates({ ...states, loading: true });

    const res = await fetch(`/api/verify/email`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // Handle error cases
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText,
        variant: "destructive",
      });
      setStates({
        ...states,
        loading: false,
      });
      return;
    }

    // Display success message
    setStates({
      ...states,
      loading: false,
    });
    toast({
      title: "SUCCESS",
      description: res.statusText,
    });
    try_refresh();
    setTimeout(() => {
      route.push("/account/home");
    }, 1500);
  };

  return (
    <div className="w-full flex-col gap-3 p-2 h-full">
      {/* SlideIn animation for the top part of the page */}
      <SlideIn className="w-full">
        <div className="w-full flex items-center justify-between">
          <Button
            name="Back"
            disabled={false}
            onClick={() => route.back()}
            varient="outlined"
            className="h-[2.5rem] hover:text-white outline w-[20%] transition-all ease-linear  rounded-md"
          />
          <Logo color="purple" size="medium" />
        </div>
      </SlideIn>

      {/* SlideFromBelow animation for the main content of the page */}
      <SlideFromBelow className="w-full flex-col gap-3 flex items-center justify-center h-full">
        <h2 className="text-2xl text-purple-500 sm:text-lg text-left w-full font-semibold">
          Verify your email
        </h2>
        {/* Input for email */}
        <Input
          error={email ? !confirm_email : false}
          value={email}
          setValue={setEmail}
          type="email"
          placeholder="Your Email Address"
        />

        {/* Input for OTP */}
        {states.verification_sent && (
          <Input
            value={otp}
            setValue={setOtp}
            type="text"
            placeholder="6-digit OTP"
          />
        )}

        {/* Buttons for sending code and confirming email */}
        <div className="w-full flex items-center justify-end gap-3">
          <Button
            name="Send Code"
            states={
              states.loading
                ? "loading"
                : states.verification_sent
                ? "complete"
                : undefined
            }
            disabled={email && confirm_email && !states.loading ? false : true}
            varient="outlined"
            onClick={request_otp}
            className="h-[2.5rem] px-3 rounded-md"
          />
          <Button
            name="Confirm Email"
            disabled={
              states.verification_sent &&
              otp.toString().length === 6 &&
              !states.loading
                ? false
                : true
            }
            varient="filled"
            onClick={verify_otp}
            className="h-[2.5rem] px-3 rounded-md"
          />
        </div>
      </SlideFromBelow>
    </div>
  );
};

export default Page;
