"use client";

import React from "react";
import FadeIn from "../Animations/fadeIn";
import { BsShieldFillCheck } from "react-icons/bs";
import { FiUserPlus } from "react-icons/fi";
import DebitCard from "../debitCard";
import SlideIn from "../Animations/slideIn";
import { useGetId } from "@/Hooks/useGetId";
import { useStore } from "@/provider";
import { useLocalStorage } from "@/Hooks/useLocalStorage";

const AuthBackground = () => {
  const pathname = useGetId(2) as string;
  const { is_darkmode } = useStore();

  const check_window = typeof window !== "undefined";
  const username = check_window
    ? JSON.parse(localStorage.getItem("username") as string)
    : "Guest";

  return (
    <div className="w-full h-full flex items-center flex-col gap-2 justify-center signUpGradient">
      <FadeIn>
        <div className="w-1/2 md:hidden sm:hidden relative">
          <span className="absolute rounded-md navGlassmorphism text-purple-700 text-xl flex items-center -ml-5 justify-center z-10 p-2 top-[35%] left-0">
            <BsShieldFillCheck />
          </span>
          <span className="absolute flex items-center justify-center rounded-md navGlassmorphism text-purple-700 text-xl z-10 p-2 -top-5 -right-[100%]">
            <FiUserPlus />
          </span>
          <DebitCard
            type={is_darkmode ? "color" : "glassmorphism"}
            name="SuleimanG"
            accountNumber={8088362315}
            balance={1000}
          />
        </div>
      </FadeIn>
      <SlideIn>
        <p className="text-3xl sm:text-xl hidden liner text-purple-900 text-center w-full md:block sm:block">
          {/* Change suleiman to property in localstorage */}
          {pathname === "account-recovery"
            ? "Let's recover your account"
            : pathname === "signin"
            ? `Welcome ${username}!`
            : pathname === "signup"
            ? "Let's get started"
            : "Forgot your password?🤔"}
        </p>
        <p className="text-xl md:hidden sm:hidden px-2 md:text-2xl sm:text-2xl text-center">
          Embark on the path to financial freedom - Your journey begins here!
        </p>
        <span className="text-purple-800 md:hidden sm:hidden w-full flex justify-center text-center">
          Ready to safeguard and grow your money...
        </span>
      </SlideIn>
    </div>
  );
};

export default AuthBackground;
