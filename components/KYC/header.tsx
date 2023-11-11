"use client";

import { useStore } from "@/provider";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

const Header = () => {
  const { KYC_steps, addKYC_steps } = useStore();
  const pathname = (usePathname() as string).split("/");

  useEffect(() => {
    switch (pathname[2]) {
      case "personal-details":
        addKYC_steps([1]);
        break;
      case "id-details":
        addKYC_steps([1, 2]);
        break;
      case "bank-details":
        addKYC_steps([1, 2, 3]);
        break;

      default:
        break;
    }
  }, [pathname[2]]);

  return (
    <div className="w-full flex gap-7 items-center px-3 justify-between">
      <div className="w-full flex items-center justify-between">
        <div
          className={`w-[2.5rem] text-white ${
            KYC_steps.includes(1) ? "bg-purple-500" : "bg-gray-400"
          } grid place-content-center cursor-pointer h-[2.5rem]   rounded-full`}
        >
          1
        </div>
        <div
          className={`w-[9.5rem] ${
            KYC_steps.includes(1) ? "bg-purple-500" : "bg-gray-400"
          } h-[1.3px]`}
        />
        <div
          className={`w-[2.5rem] grid place-content-center text-white cursor-pointer ${
            KYC_steps.includes(2) ? "bg-purple-500" : "bg-gray-400"
          } h-[2.5rem] rounded-full`}
        >
          2
        </div>
        <div
          className={`w-[9.5rem] ${
            KYC_steps.includes(2) ? "bg-purple-500" : "bg-gray-400"
          } h-[1.3px]`}
        />
        <div
          className={`w-[2.5rem] grid place-content-center text-white cursor-pointer ${
            KYC_steps.includes(3) ? "bg-purple-500" : "bg-gray-400"
          } h-[2.5rem] rounded-full`}
        >
          3
        </div>
      </div>
    </div>
  );
};

export default Header;
