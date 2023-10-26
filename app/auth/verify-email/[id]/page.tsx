"use client";

import { useCheck } from "@/Hooks/useCheck";
import { otpProps } from "@/app/api/auth/requestOTP/route";
import Button from "@/components/button";
import Input from "@/components/input";
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import SlideIn from "@/components/Animations/slideIn";
import Logo from "@/components/logo";
import SlideFromBelow from "@/components/Animations/slideFromBelow";

const Page = ({ params: { id } }: { params: { id: string } }) => {
  const [states, setStates] = useState({
    verification_sent: false,
    verification_failed: false,
    email_sending_error: false,
    loading: false,
    too_many_requests: false,
    success: false,
    error_text: "",
  });

  const { toast } = useToast();
  const route = useRouter();

  const [email, setEmail] = useState<string | number>("");
  const [otp, setOtp] = useState<string | number>("");

  const confirm_email = useCheck(email as string, "email");

  const request_otp = async () => {
    //
    setStates({ ...states, loading: true });
    const payloay: otpProps = {
      loginMode: "email",
      email: email as string,
    };

    const res = await fetch("/api/auth/requestOTP", {
      method: "POST",
      body: JSON.stringify(payloay),
    });

    if (!res.ok) {
      setStates({
        ...states,
        loading: false,
        error_text: res.statusText,
        email_sending_error: true,
        verification_sent: false,
      });

      res.status === 429 && setStates({ ...states, too_many_requests: true });
      toast({
        variant: "destructive",
        title: "Something went wrong",
      });
      return;
    }

    toast({
      title: "OTP send to email provided",
    });
    setStates({
      ...states,
      verification_sent: true,
      loading: false,
      email_sending_error: false,
      error_text: "",
    });
  };

  const verify_otp = async () => {
    //
    const payload: otpProps & { otp: string | number } = {
      loginMode: "email",
      email: email as string,
      otp: otp,
    };

    setStates({ ...states, loading: true });

    const res = await fetch(`/api/verify/email`, {
      method: "POST",
      headers: {
        user_id: id,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setStates({
        ...states,
        loading: false,
        error_text: res.statusText,
        success: false,
        verification_failed: true,
      });
      return;
    }

    setStates({
      ...states,
      success: true,
      loading: false,
      error_text: "",
      verification_failed: false,
    });
  };

  return (
    <div className="w-full flex-col gap-3 p-2 h-full">
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
      <SlideFromBelow className="w-full flex-col gap-3 flex items-center justify-center h-full">
        <h2 className="text-2xl text-purple-500 sm:text-lg text-left w-full font-semibold">
          Verify your email
        </h2>
        <Input
          error={email ? !confirm_email : false}
          value={email}
          setValue={setEmail}
          type="email"
          placeholder="Your Email Address"
        />
        {states.verification_sent && (
          <Input
            value={otp}
            setValue={setOtp}
            type="text"
            placeholder="5-digit OTP"
          />
        )}
        {states.email_sending_error && (
          <span className="text-left w-full text-base text-red-400">
            {states.error_text}
          </span>
        )}
        {states.success && (
          <span className="text-left w-full text-base text-green-400">
            Your email has been verify
          </span>
        )}
        <div className="w-full flex items-center justify-end gap-3">
          <Button
            name="Send Code"
            disabled={states.too_many_requests}
            varient="outlined"
            onClick={request_otp}
            className="h-[2.5rem] px-3 rounded-md"
          />
          <Button
            name="Confirm Email"
            disabled={true}
            varient="filled"
            onClick={() => {}}
            className="h-[2.5rem] px-3 rounded-md"
          />
        </div>
      </SlideFromBelow>
    </div>
  );
};

export default Page;
