"use client";

import SlideIn from "@/components/Animations/slideIn";
import Button from "@/components/button";
import Input from "@/components/input";
import Logo from "@/components/logo";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState<string | number>("");
  const [confirmPassword, setConfirmPassword] = useState<string | number>("");
  const [passwordStates, setPasswordStates] = useState({
    haveNumber: 0,
    haveSpecialCharacter: 0,
    lengthGTSix: 0,
    haveLowercase: 0,
    haveUppercase: 0,
  });

  //Password check
  useEffect(() => {
    const updatedStates = {
      haveNumber: /\d+/.test(newPassword as string) ? 20 : 0,
      haveSpecialCharacter: /[\W_]+/.test(newPassword as string) ? 20 : 0,
      lengthGTSix: /^(.{6,})$/.test(newPassword as string) ? 20 : 0,
      haveLowercase: /[a-z]/.test(newPassword as string) ? 20 : 0,
      haveUppercase: /[A-Z]/.test(newPassword as string) ? 20 : 0,
    };

    setPasswordStates(updatedStates);
  }, [newPassword]);

  //TODO:Verify ID for change-password

  //TODO:RESET Password function

  return (
    <section className="w-full p-2 h-full">
      <div className="w-full h-full">
        <SlideIn>
          <div className="w-full flex items-center justify-between">
            <Button
              name="Back"
              disabled={false}
              onClick={() => router.back()}
              varient="outlined"
              className="h-[2.5rem] hover:text-white outline w-[20%] transition-all ease-linear  rounded-md"
            />
            <Logo color="purple" size="medium" />
          </div>
        </SlideIn>
        <div className="w-full h-full flex items-center justify-center flex-col">
          <div className="w-full flex flex-col gap-1 items-start justify-start">
            <p className="text-4xl text-purple-700">Change Password!</p>
            <span>Set a password you can easily remember</span>
          </div>
          <form className="w-full flex flex-col gap-3" action="">
            <Input
              value={newPassword as string}
              setValue={setNewPassword}
              disabled={false}
              error={false}
              type="password"
              placeholder="New password"
              //@ts-ignore
              password_strength={
                passwordStates.haveLowercase +
                passwordStates.haveNumber +
                passwordStates.haveSpecialCharacter +
                passwordStates.haveUppercase +
                passwordStates.lengthGTSix
              }
            />
            <Input
              value={confirmPassword as string}
              setValue={setConfirmPassword}
              disabled={false}
              error={false}
              type="password"
              placeholder="Confirm password"
              password_strength={
                passwordStates.haveLowercase +
                  passwordStates.haveNumber +
                  passwordStates.haveSpecialCharacter +
                  passwordStates.haveUppercase +
                  passwordStates.lengthGTSix ===
                  100 && newPassword === confirmPassword
                  ? 100
                  : 0
              }
            />
            <Button
              name="Reset password"
              disabled={
                passwordStates.haveLowercase +
                  passwordStates.haveNumber +
                  passwordStates.haveSpecialCharacter +
                  passwordStates.haveUppercase +
                  passwordStates.lengthGTSix ===
                  100 && newPassword === confirmPassword
                  ? false
                  : true
              }
              varient="filled"
              onClick={() => {}}
              className="h-[2.5rem]"
              borderRadius={true}
            />
          </form>
        </div>
      </div>
    </section>
  );
};

export default Page;
