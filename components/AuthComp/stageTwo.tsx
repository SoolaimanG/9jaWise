import React, { SetStateAction, useEffect, useState } from "react";
import Button from "../button";
import Input from "../input";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { Checkbox } from "../ui/checkbox";
import { toast } from "../ui/use-toast";
import { DialogDescription, DialogTitle } from "../ui/dialog";
import { DialogAlert } from "../dialogAlert";
import { useRouter, useSearchParams } from "next/navigation";

export type stageTwoProps = {
  authType: "otp" | "password";
  loginMode: "email" | "phoneNumber";
  password: string;
  accountType: "personal" | "business";
  email: string;
  createAccount: (password: string) => Promise<void>;
  otp: string;
  setOtp: React.Dispatch<SetStateAction<string | number>>;
  phoneNumber: string;
  setAccountType: React.Dispatch<SetStateAction<"personal" | "business">>;
  setState: React.Dispatch<SetStateAction<"first" | "second">>;
  setPassword: React.Dispatch<SetStateAction<string | number>>;
  setAuthType: React.Dispatch<SetStateAction<"otp" | "password">>;
  accountState: "loading" | "failed" | "success" | "";
  setAccountState: React.Dispatch<
    SetStateAction<"loading" | "failed" | "success" | "">
  >;
};
export type otpProps = {
  otpRequested: "requested" | "requestFailed" | "notRequested" | "pending";
  numberOfRequest: number;
  otpVerification: "pending" | "failed" | "complete" | "normal";
};
const accountTypes = [
  {
    type: "personal",
    desc: "Ideal for individuals looking to manage their finances.",
  },
  {
    type: "business",
    desc: "Designed for business owners and entrepreneurs.",
  },
];

const StageTwo: React.FC<stageTwoProps> = ({
  authType,
  setAuthType,
  setState,
  accountType,
  otp,
  createAccount,
  setOtp,
  email,
  setAccountType,
  password,
  setPassword,
  loginMode,
  accountState,
}) => {
  //---->States use to verify strength of password for users<-----
  const [validPassword, setValidPassword] = useState({
    strength: 0,
    is_mathching: false,
  });
  const [password_strength, setPassword_strength] = useState({
    length: 0,
    specialChar: 0,
    lowerCase: 0,
    upperCase: 0,
    number: 0,
  });

  //---->States for OTP i.e is it sent, is the request failed or default<----
  const [otpStates, setOtpStates] = useState<otpProps>({
    otpRequested: "notRequested",
    numberOfRequest: 0,
    otpVerification: "normal",
  });

  const [acceptCondition, setAcceptCondition] = useState(false); //Terms & COndition must be True
  const [stateText, setStateText] = useState(""); //State text means the current state of the request ->Failed or Success
  const [confirmPassword, setConfirmPassword] = useState<string | number>("");

  const route = useRouter(); //NEXTJS router for routing navigating btw pages

  //Checking the password length whenver each validation requirement is meet increment +20 to tell the user the progress
  useEffect(() => {
    const newPasswordStrength = {
      length: /^(.{6,})$/.test(password) ? 20 : 0,
      specialChar: /[\W_]+/.test(password) ? 20 : 0,
      number: /\d+/.test(password) ? 20 : 0,
      lowerCase: /[a-z]/.test(password) ? 20 : 0,
      upperCase: /[A-Z]/.test(password) ? 20 : 0,
    };

    const strength =
      newPasswordStrength.length +
      newPasswordStrength.lowerCase +
      newPasswordStrength.number +
      newPasswordStrength.specialChar +
      newPasswordStrength.upperCase;

    //@ts-ignore
    setPassword_strength(newPasswordStrength);

    setValidPassword({
      ...validPassword,
      strength,
    });

    if (confirmPassword) {
      //
      setValidPassword({
        strength,
        is_mathching: password === confirmPassword,
      });
    }
  }, [password, confirmPassword]);

  //Send a request for the OTP token
  const requestOTPToken = async () => {
    setOtpStates({ ...otpStates, otpRequested: "pending" });

    const res = await fetch("/api/auth/requestOTP", {
      method: "POST",
      body: JSON.stringify({ loginMode, email }),
      headers: { "Content-Type": "application/json" },
    });

    setOtpStates({
      ...otpStates,
      numberOfRequest: otpStates.numberOfRequest + 1,
    });

    //If the account creation is !Successful then notify the user or client
    if (!res.ok) {
      setOtpStates({ ...otpStates, otpRequested: "requestFailed" });
      setOtpStates({ ...otpStates, otpVerification: "normal" });
      setStateText(res.statusText);
      toast({
        variant: "destructive",
        title: `Error ${res.status}`,
        description: res.statusText,
      });
      return;
    }

    //
    setStateText(res.statusText);
    setOtpStates({ ...otpStates, otpRequested: "requested" });
    setOtpStates({ ...otpStates, otpVerification: "normal" });
    toast({
      title: "SUCCESS",
      description: res.statusText,
    });
  };

  //A modal to be display if the account creation is successful so users can navigate to sign page --> auth/signin
  const account_created = (
    <DialogAlert
      open={accountState === "success"}
      button={<></>}
      content={
        <div className="w-full flex flex-col gap-4">
          <DialogTitle className="text-center text-gray-500 dark:text-gray-300">
            Account Created Successfully
          </DialogTitle>
          {loginMode === "email" ? (
            <DialogDescription className="capitalize text-center">
              Congratulations your account has been created successfully, Please
              check your email (SPAN FOLDER).
            </DialogDescription>
          ) : (
            <DialogDescription className="capitalize text-center">
              <DialogDescription className="capitalize text-center">
                Congratulations your account has been created successfully,
                Unfortunately we cannot send you an SMS right now.
              </DialogDescription>
            </DialogDescription>
          )}
          <div className="flex gap-2 items-center">
            <Button
              varient="outlined"
              className="w-full outline hover:text-white h-[2.5rem]"
              onClick={() => route.push("/auth/signin")}
              disabled={false}
              borderRadius
              name="Go to login"
            />
          </div>
        </div>
      }
    />
  );

  return (
    <div className="mt-3 w-full">
      <div className="w-full flex flex-col gap-2">
        <span>How do you want your authentication flow</span>
        <div className="w-full flex gap-2 items-center">
          <Button
            className="w-full h-[2.5rem] rounded-md"
            varient={authType === "otp" ? "filled" : "outlined"}
            name="OTP"
            disabled={false}
            onClick={() => setAuthType("otp")}
          />
          <Button
            className="w-full h-[2.5rem] rounded-md"
            varient={authType === "password" ? "filled" : "outlined"}
            name="Password"
            disabled={false}
            onClick={() => setAuthType("password")}
          />
        </div>
        <div className="w-full">
          {authType === "otp" ? (
            <>
              <div className="flex w-full items-center gap-2">
                <Input
                  value={otp}
                  type="text"
                  is_loading={otpStates.otpVerification === "pending" && true}
                  error={false}
                  disabled={loginMode === "phoneNumber" ? true : false}
                  setValue={setOtp}
                  placeholder="OTP"
                />
                <Button
                  className="h-[2.5rem] px-4 rounded-md"
                  varient="filled"
                  name="Request"
                  states={
                    otpStates.otpRequested === "requestFailed"
                      ? "failed"
                      : otpStates.otpRequested === "requested"
                      ? "complete"
                      : otpStates.otpRequested === "pending"
                      ? "loading"
                      : undefined
                  }
                  disabled={
                    otpStates.otpRequested === "pending" ||
                    loginMode === "phoneNumber"
                  }
                  onClick={requestOTPToken}
                />
              </div>
              {/* UI error handling > */}
              {stateText && (
                <p className="text-green-500 text-[0.9rem]">{stateText}</p>
              )}
            </>
          ) : (
            <div className="w-full flex flex-col gap-2">
              <Input
                value={password}
                //@ts-ignore
                password_strength={
                  password_strength.length +
                  password_strength.lowerCase +
                  password_strength.number +
                  password_strength.specialChar +
                  password_strength.upperCase
                }
                type="password"
                error={
                  validPassword.strength === 0
                    ? false
                    : validPassword.strength === 100
                    ? false
                    : true
                }
                disabled={false}
                setValue={setPassword}
                placeholder="Password"
              />
              <Input
                value={confirmPassword}
                //@ts-ignore
                password_strength={
                  confirmPassword && password === confirmPassword ? 100 : 0
                }
                type="password"
                error={confirmPassword ? !validPassword.is_mathching : false}
                disabled={false}
                setValue={setConfirmPassword}
                placeholder="Confirm Password"
              />
            </div>
          )}
        </div>
        <span>Type of account you want to open!</span>
        <div className="w-full flex flex-col gap-2">
          {accountTypes.map((acct) => (
            <button
              //@ts-ignore
              onClick={() => setAccountType(acct.type)}
              key={acct.type}
              className={`w-full hover:bg-purple-700 hover:text-white transition-all delay-75 ${
                acct.type === accountType && "bg-purple-700 text-white"
              } ease-linear border flex gap-2 items-center border-purple-500 p-3 rounded-md`}
            >
              {acct.type === accountType ? (
                <span className="text-white">
                  <BsFillCheckCircleFill />
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full border border-gray-300" />
              )}
              <div className="w-full flex items-start flex-col gap-1">
                <h2 className=" capitalize">{acct.type}</h2>
                <p className="text-left">{acct.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="flex w-full justify-start items-center gap-1">
          <Checkbox
            checked={acceptCondition}
            onCheckedChange={() => setAcceptCondition((prev) => !prev)}
          />
          <p>Click to accept terms and condition</p>
        </div>
        <div className="w-full flex gap-2 items-end justify-end">
          <Button
            name="Back"
            disabled={false}
            varient="filled"
            borderRadius={true}
            onClick={() => setState("first")}
            className="px-3 h-[2.5rem]"
          />
          <Button
            name="Create Account"
            disabled={
              authType === "password"
                ? password && password === confirmPassword && acceptCondition
                  ? false
                  : true
                : acceptCondition && otp
                ? false
                : true
            }
            borderRadius={true}
            varient="filled"
            onClick={() => createAccount(confirmPassword as string)}
            states={accountState === "loading" ? "loading" : undefined}
            className="px-3 h-[2.5rem]"
          />
        </div>
        {/* Can be place any where */}
        {account_created}
      </div>
    </div>
  );
};

export default StageTwo;
