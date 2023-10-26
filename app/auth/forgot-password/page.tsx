"use client";

import SlideFromBelow from "@/components/Animations/slideFromBelow";
import SlideIn from "@/components/Animations/slideIn";
import Button from "@/components/button";
import Input from "@/components/input";
import Logo from "@/components/logo";
import { toast } from "@/components/ui/use-toast";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Page = () => {
  const router: AppRouterInstance = useRouter();
  const [loginID, setLoginID] = useState<string | number>("");
  const [loading, setLoading] = useState(false);

  const requestChange = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/forget-password", {
      method: "POST",
      body: JSON.stringify({ loginID: loginID }),
    });

    if (!res.ok) {
      setLoading(false);
      toast({
        title: "Error",
        description: res.statusText,
        variant: "destructive",
      });
      return;
    }

    setLoading(false);
    toast({
      title: "Success",
      description: res.statusText,
    });
  };

  return (
    <div className="w-full h-full p-2">
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
      <SlideFromBelow>
        <div className="w-full flex items-center flex-col gap-3 justify-center h-full">
          <div className="w-full flex flex-col gap-1 items-start justify-start">
            <h2 className="text-4xl md:text-2xl sm:text-2xl text-purple-700">
              Forgot your password?
            </h2>
            <span>You are on your way to reset it😊</span>
          </div>
          <div className="w-full flex items-center flex-col gap-3 justify-center">
            <Input
              value={loginID}
              setValue={setLoginID}
              disabled={false}
              type="text"
              error={false}
              placeholder="Email/Phone Number"
            />
            <Button
              className="w-full h-[2.5rem]"
              borderRadius={true}
              name="Request Change"
              disabled={loginID && !loading ? false : true}
              states={loading ? "loading" : undefined}
              varient="filled"
              onClick={requestChange}
            />
          </div>
        </div>
      </SlideFromBelow>
    </div>
  );
};

export default Page;
