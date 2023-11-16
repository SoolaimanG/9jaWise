"use client";

import { useCheck } from "@/Hooks/useCheck";
import { addStatusMessage } from "@/components/Account/data";
import FadeIn from "@/components/Animations/fadeIn";
import SlideIn from "@/components/Animations/slideIn";
import Button from "@/components/button";
import Input from "@/components/input";
import Logo from "@/components/logo";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = ({ params: { _id } }: { params: { _id: string } }) => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState<string | number>("");
  const [confirmPassword, setConfirmPassword] = useState<string | number>("");
  const [loading, setLoading] = useState(false);
  const [passwordStates, setPasswordStates] = useState({
    haveNumber: 0,
    haveSpecialCharacter: 0,
    lengthGTSix: 0,
    haveLowercase: 0,
    haveUppercase: 0,
  });

  const check_password = useCheck(newPassword as string, "password");

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

  //RESET Password function
  const reset_password = async () => {
    // Check if the password meets the specified requirements
    if (!check_password) {
      toast({
        title: "ERROR 400",
        description: "Password requirement is not met",
        variant: "destructive",
      });
      return;
    }

    // Check if the new password and confirm password match
    if (String(newPassword).trim() !== String(confirmPassword).trim()) {
      toast({
        title: "ERROR 400",
        description: "Password is not matching",
        variant: "destructive",
      });
      return;
    }

    // Set loading to true to indicate that the password change process is in progress
    setLoading(true);

    // Prepare payload for the API request
    const payload = {
      password: newPassword,
      confirmPassword: confirmPassword,
      id: _id,
    };

    // Send a POST request to the change-password API endpoint
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/auth/change-password`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    // Check if the API request was unsuccessful
    if (!res.ok) {
      // Reset loading state and display an error toast message
      setLoading(false);
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText || addStatusMessage(res.status as 400),
        variant: "destructive",
      });
      return;
    }

    //Reset input
    setNewPassword("");
    setConfirmPassword("");

    // Reset loading state and display a success toast message
    setLoading(false);
    toast({
      title: "SUCCESS",
      description: res.statusText || addStatusMessage(200),
    });
  };

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
          <SlideIn className="w-full flex flex-col gap-1 items-start justify-start">
            <p className="text-4xl text-purple-700">Change Password!</p>
            <span>Set a password you can easily remember</span>
          </SlideIn>
          <FadeIn className="w-full flex flex-col gap-3">
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
              disabled={check_password && !loading ? false : true}
              varient="filled"
              onClick={reset_password}
              className="h-[2.5rem]"
              states={loading ? "loading" : undefined}
              borderRadius={true}
            />
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default Page;
