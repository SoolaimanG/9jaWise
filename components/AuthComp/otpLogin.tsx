import React, { useEffect, useState } from "react";
import Input from "../input";
import Button from "../button";
import { requestProps } from "@/app/auth/signin/page";
import { otpProps } from "@/app/api/auth/requestOTP/route";
import { toast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ToastAction } from "@radix-ui/react-toast";
import { useCheck } from "@/Hooks/useCheck";

export type otpLoginProps = {
  loginMode: "otp" | "password";
};

const OtpLogin: React.FC<otpLoginProps> = ({ loginMode }) => {
  const [requestSent, setRequestSent] = useState<requestProps>("not-requested");
  const [loginID, setLoginID] = useState<string | number>("");
  const [otp, setOTP] = useState<string | number>("");
  const route = useRouter();
  const [loading, setLoading] = useState(false);

  const requestOTP = async () => {
    //
    setLoading(true);
    const payload: otpProps = {
      loginMode: "email",
      email: loginID as string,
    };

    const res = await fetch("/api/auth/requestOTP", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      //
      setRequestSent("failed");
      setLoading(false);
      toast({
        title: "ERROR" + res.status.toString(),
        description: res.statusText,
        variant: "destructive",
      });
      return;
    }

    setLoading(false);
    setRequestSent("sent");
    toast({
      title: res.statusText,
    });
  };

  const verifyOTP = async () => {
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      callbackUrl: "/",
      loginID: loginID,
      otp: otp,
      password: "",
      loginMode: "otp",
    });

    if (res?.error) {
      setLoading(false);
      toast({
        title: "Error",
        description: res.error,
        variant: "destructive",
        action: (
          <ToastAction onClick={verifyOTP} altText="Try Again">
            Retry
          </ToastAction>
        ),
      });
      return;
    }

    setLoading(false);
    route.push(`/account/home`);
  };

  useEffect(() => {
    if (otp.toString().length >= 6) {
      verifyOTP();
    }
  }, [otp]);

  return (
    <div className="w-full flex flex-col gap-3 items-center">
      <p className="text-2xl sm:text-xl text-center text-purple-500">
        Sign in with One-Time-Passcode.
      </p>
      <Input
        value={loginID}
        setValue={setLoginID}
        disabled={false}
        type="text"
        error={false}
        placeholder="Email or Phone Number"
      />
      <div className="w-full flex items-center gap-1">
        <Input
          value={otp}
          setValue={setOTP}
          disabled={loading}
          type="text"
          error={requestSent === "failed"}
          placeholder="OTP"
        />
        <Button
          className="w-fit px-4 h-[2.5rem]"
          name="Request"
          states={loading ? "loading" : undefined}
          borderRadius={true}
          onClick={requestOTP}
          disabled={loginID && !loading ? false : true}
          varient="filled"
        />
      </div>
      {requestSent === "sent" && (
        <span className="text-green-500 text-left w-full">{`OTP sent to the field provided`}</span>
      )}
      {requestSent === "failed" && (
        <span className="text-left w-full text-red-500">{`OTP request failed`}</span>
      )}
    </div>
  );
};

export default OtpLogin;
