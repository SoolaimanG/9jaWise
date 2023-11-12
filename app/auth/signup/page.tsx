"use client";

//-------------->All Imports<--------------
import FadeIn from "@/components/Animations/fadeIn";
import SlideFromBelow from "@/components/Animations/slideFromBelow";
import Header from "@/components/Navbars/header";
import StageOne from "@/components/AuthComp/stageOne";
import StageTwo from "@/components/AuthComp/stageTwo";
import { useState } from "react";
import { signUpProps } from "@/app/api/auth/signup/route";
import { toast } from "@/components/ui/use-toast";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const params = useSearchParams(); //NEXTJS Search params to get the URL params

  //--------->States for signup users<-----------
  const [state, setState] = useState<"first" | "second">("first");
  const [fullName, setFullName] = useState<string | number>("");
  const [password, setPassword] = useState<string | number>("");
  const [email, setEmail] = useState<string | number>(
    params.has("email") ? (params.get("email") as string) : ""
  );
  const [phoneNumber, setPhoneNumber] = useState<string | number>("");
  const [accountType, setAccountType] = useState<"personal" | "business">(
    "personal"
  );
  const [otp, setOtp] = useState<string | number>("");
  const [occupation, setOccupation] = useState<string | number>("");

  //--------->Auththentication flow<-------------
  const [authType, setAuthType] = useState<"otp" | "password">("password");
  const [loginMode, setLoginMode] = useState<"phoneNumber" | "email">(
    params.has("email") ? "email" : "phoneNumber"
  );

  //--->Tracking Request States[is the request successfull or it's not or loading]<-----
  const [accountState, SetAccountState] = useState<
    "loading" | "failed" | "success" | ""
  >("");

  //Async func to create a new user account
  const createAccount = async (confirmPassword: string | number) => {
    //Payload needed ro create a new account
    const payload: signUpProps & { otp: string | number } = {
      loginType: loginMode,
      loginMode: authType,
      fullName: fullName as string,
      email: email as string,
      phoneNumber: phoneNumber as string,
      occupation: occupation as string,
      accountType: accountType,
      acceptTermsAndConditions: true,
      password: password as string,
      confirmPassword: confirmPassword as string,
      otp: otp,
    };

    SetAccountState("loading"); //Start loading
    const res = await fetch(`https://9ja-wise.vercel.app/api/auth/signup`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    //If the response is not !OK notify the user
    if (!res.ok) {
      SetAccountState("failed");
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText,
        variant: "destructive",
      });
      return;
    }

    SetAccountState("success"); //This is to show modal
  };

  return (
    <section className="w-full h-full">
      {/* SIGNUP CONTENT HERE */}
      <div className="w-full p-2 overflow-auto flex flex-col gap-2 md:basis-[80%] sm:basis-[80%] basis-[40%]">
        <FadeIn>
          <Header state="SignIn" />
        </FadeIn>
        {/* Onboarding State */}
        <FadeIn>
          <div className="w-full flex items-center justify-center">
            <div
              className={`w-5 cursor-pointer h-5 ${
                state === "first" && "animate-pulse"
              } bg-purple-500 rounded-full`}
            />
            <div
              className={`w-[8rem] ${
                state !== "second" ? "bg-gray-300" : "bg-purple-500"
              } h-[2px]`}
            />
            <div
              className={`w-5 cursor-pointer ${
                state !== "second"
                  ? "bg-gray-300"
                  : "bg-purple-500 animate-pulse"
              } h-5 rounded-full`}
            />
          </div>
        </FadeIn>
        <SlideFromBelow key={state}>
          {state === "first" ? (
            <StageOne
              fullName={fullName as string}
              occupation={occupation as string}
              setOccupation={setOccupation}
              setFullName={setFullName}
              loginMode={loginMode}
              setLoginMode={setLoginMode}
              setState={setState}
              phoneNumber={phoneNumber as string}
              setPhoneNumber={setPhoneNumber}
              email={email as string}
              setEmail={setEmail}
            />
          ) : (
            <StageTwo
              otp={otp as string}
              createAccount={createAccount}
              setOtp={setOtp}
              setAccountState={SetAccountState}
              accountState={accountState}
              password={password as string}
              email={email as string}
              phoneNumber={phoneNumber as string}
              accountType={accountType}
              setAccountType={setAccountType}
              setAuthType={setAuthType}
              setState={setState}
              authType={authType}
              loginMode={loginMode}
              setPassword={setPassword}
            />
          )}
        </SlideFromBelow>
      </div>
    </section>
  );
};

export default Page;
