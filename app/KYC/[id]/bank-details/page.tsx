"use client";

import SlideIn from "@/components/Animations/slideIn";
import Header from "@/components/KYC/header";
import Button from "@/components/button";
import Input from "@/components/input";
import { usePathname, useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import React, { useEffect, useState } from "react";
import { AiFillCheckCircle } from "react-icons/ai";

const BVN_Access = ["Name", "Phone Number", "Email Address", "Date of birth"];

const Page = () => {
  const [bvn, setBvn] = useState<string | number>("");
  const [email, setEmail] = useState<string | number>("");

  const router = useRouter();
  const pathname = (usePathname() as string).split("/");

  return (
    <div className="w-full flex flex-col gap-3 h-full">
      <Header />
      <SlideIn>
        <p className="text-2xl p-1 text-purple-500">Bank verification number</p>
        <p className="text-lg p-1 break-words">
          Confirming your BVN helps us verify your identity and allow us to
          generate unique account number for you
        </p>

        <div className="w-full mt-3 p-1 flex items-center gap-3 flex-col">
          <Input
            value={email as string}
            setValue={setEmail}
            type="text"
            disabled={false}
            error={false}
            placeholder="Email Address (hi@devtobs.com)"
          />
          <Input
            value={bvn as string}
            countChar={true}
            max={11}
            setValue={setBvn}
            type="text"
            disabled={false}
            error={false}
            placeholder="BVN (222-255-866-22)"
          />
          <Modal
            button={
              <button className="underline w-full items-start justify-start flex text-purple-600 text-[0.9rem] p-1">
                Why do we need bvn?
              </button>
            }
            content={
              <div className="w-full flex flex-col gap-2">
                <p className="text-3xl text-purple-700">
                  Why we need your bvn?
                </p>
                <p>
                  The goal of Bank Verification Number [BVN] is to uniquely
                  verify the identity of a customer for KYC purposes.
                </p>
                <div className="w-full flex gap-2">
                  <span className="flex flex-col text-xl text-purple-700 items-center gap-[2px] mt-1">
                    <AiFillCheckCircle />
                    <div className="w-[2px] h-full bg-purple-700" />
                  </span>
                  <div>
                    <p className=" font-semibold ">
                      We only have access to your:
                    </p>
                    {BVN_Access.map((_) => (
                      <li className="ml-3" key={_}>
                        {_}
                      </li>
                    ))}
                  </div>
                </div>
                <p>
                  Confirming your bvn does not gives us access to your bank
                  account(s) and we cannot use your bvn to transfer money from
                  your bank account(s).
                </p>
                <span className="text-gray-500">
                  As a matter of fact your bvn is only use here.
                </span>
              </div>
            }
          />

          <div className="w-full flex mt-5 items-end justify-end gap-2">
            <Button
              name="Back"
              onClick={() => router.back()}
              disabled={false}
              varient="outlined"
              borderRadius={true}
              className="w-1/4 h-[2.5rem]"
            />
            <Button
              name="Complete"
              onClick={() => {}}
              disabled={(bvn as string).length === 11 ? false : true}
              varient="filled"
              borderRadius={true}
              className="w-1/4 h-[2.5rem]"
            />
          </div>
        </div>
      </SlideIn>
    </div>
  );
};

export default Page;
