import React, { FormEvent, SetStateAction } from "react";
import Input from "../input";
import Button from "../button";
import { useCheck } from "@/Hooks/useCheck";
import { useSearchParams } from "next/navigation";

export type stageOneProps = {
  loginMode: "phoneNumber" | "email";
  fullName: string;
  email: string;
  phoneNumber: string;
  setPhoneNumber: React.Dispatch<SetStateAction<string | number>>;
  occupation: string;
  setOccupation: React.Dispatch<SetStateAction<string | number>>;
  setEmail: React.Dispatch<SetStateAction<string | number>>;
  setState: React.Dispatch<SetStateAction<"first" | "second">>;
  setFullName: React.Dispatch<SetStateAction<string | number>>;
  setLoginMode: React.Dispatch<SetStateAction<"phoneNumber" | "email">>;
};

const StageOne: React.FC<stageOneProps> = ({
  loginMode,
  fullName,
  email,
  phoneNumber,
  occupation,
  setOccupation,
  setPhoneNumber,
  setEmail,
  setState,
  setFullName,
  setLoginMode,
}) => {
  const checkEmail = useCheck(email, "email"); //Custom hook to check email validity

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="mt-3 w-full flex flex-col gap-3">
      <div className="w-full">
        <p className="font-semibold text-2xl">SignUp</p>
        <span>Unlock your true power in finance.</span>
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full mt-3 flex flex-col gap-2"
        action=""
      >
        <Input
          value={fullName}
          setValue={setFullName}
          error={false}
          disabled={false}
          type="text"
          placeholder="Full Name"
        />
        <span>How do you want to login?</span>
        <div className="w-full flex gap-2 items-center">
          <Button
            className="w-full h-[2.5rem] rounded-md"
            varient={loginMode === "phoneNumber" ? "filled" : "outlined"}
            name="Phone Number"
            disabled={false}
            onClick={() => setLoginMode("phoneNumber")}
          />
          <Button
            className="w-full h-[2.5rem] rounded-md"
            varient={loginMode === "email" ? "filled" : "outlined"}
            name="Email"
            disabled={false}
            onClick={() => setLoginMode("email")}
          />
        </div>
        <div>
          {loginMode === "email" ? (
            <Input
              value={email}
              type="email"
              error={email ? !checkEmail : false}
              disabled={false}
              setValue={setEmail}
              placeholder="Email Address"
            />
          ) : (
            <Input
              value={phoneNumber}
              type="text"
              error={false}
              disabled={false}
              setValue={setPhoneNumber}
              placeholder="Phone Number"
            />
          )}
        </div>
        <Input
          value={occupation}
          type="text"
          error={false}
          disabled={false}
          setValue={setOccupation}
          placeholder="Occupation (OPTIONAL)"
        />

        <div className="w-full flex items-end justify-end">
          <Button
            className="h-[2.5rem] w-3/6 rounded-md"
            varient="filled"
            name="Next"
            disabled={fullName && (checkEmail || phoneNumber) ? false : true}
            onClick={() => setState("second")}
          />
        </div>
      </form>
    </div>
  );
};

export default StageOne;
