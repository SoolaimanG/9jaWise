"use client";

//------------>All Imports<-----------
import FadeIn from "@/components/Animations/fadeIn";
import SlideFromBelow from "@/components/Animations/slideFromBelow";
import OtpLogin from "@/components/AuthComp/otpLogin";
import PasswordLogin from "@/components/AuthComp/passwordLogin";
import Header from "@/components/Navbars/header";
import React, { useState } from "react";

export type requestProps = "failed" | "sent" | "not-requested";

const Page = () => {
  //Type of loginflow user prefer OTP | Password
  const [loginType, setLoginType] = useState<"otp" | "password">("password");

  return (
    <section className="w-full h-full">
      {/* SIGNUP CONTENT HERE */}
      <div className="w-full p-2 overflow-auto flex flex-col gap-2">
        <FadeIn>
          <Header state="SignUp" />
        </FadeIn>
        {/* Login Content */}
        <FadeIn>
          <div className="w-full mt-5 items-center justify-center flex flex-col gap-3">
            <div className="w-1/2 md:w-[70%] sm:w-[65%] m-auto p-1 bg-gray-200 justify-between dark:text-purple-500 gap-3 flex items-center rounded-md">
              <button
                onClick={() => setLoginType("otp")}
                className={`w-full ${
                  loginType === "otp" && "text-white bg-purple-700"
                } rounded-sm items-center justify-center flex h-[2.5rem]`}
              >
                OTP
              </button>
              <button
                onClick={() => setLoginType("password")}
                className={`w-full ${
                  loginType === "password" &&
                  "text-white rounded-sm bg-purple-700"
                } items-center justify-center flex h-[2.5rem]`}
              >
                Password
              </button>
            </div>
            <p>Choose your preferred auth flow</p>
          </div>
        </FadeIn>
        {
          <SlideFromBelow key={loginType}>
            {loginType === "otp" ? (
              <OtpLogin loginMode={loginType} /> // login with otp component
            ) : (
              <PasswordLogin /> //login with password component
            )}
          </SlideFromBelow>
        }
      </div>
    </section>
  );
};

export default Page;
