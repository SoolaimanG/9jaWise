//------------>All Imports<-----------
import React, { useState } from "react";
import Input from "../input";
import Button from "../button";
import Link from "next/link";
import { AiFillUnlock } from "react-icons/ai";
import { signIn } from "next-auth/react";
import { toast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";
import { useRouter } from "next/navigation";
import { useCheck } from "@/Hooks/useCheck";

const PasswordLogin = () => {
  //--------->States for Errors/Loading/Success<----------
  const [state, setState] = useState({
    invalidPassword: false,
    invalidCredentials: false,
    loginSuccess: false,
  });

  //------->Data needed for login<-----------
  const [loginID, setLoginID] = useState<string | number>("");
  const [password, setPassword] = useState<string | number>("");

  //--------->Tracking the request<---------
  const [loading, setLoading] = useState(false);

  const route = useRouter(); //NEXTJS router for navigation

  //----->Hover to see Docs<----------
  const password_strength = useCheck(password as string, "password");

  //Async func for login users in
  const login = async () => {
    setLoading(true);

    //SignIn func from NEXT-AUTH [creates a user session if successful]
    const res = await signIn("credentials", {
      redirect: false, //Prevent the signIn func from redirecting..
      callbackUrl: "/",
      loginID: loginID,
      otp: "", //Empty bcos this is password login
      password: password,
      loginMode: "password",
    });

    //If there was an error notify the user on the error
    if (res?.error) {
      setLoading(false);
      setState({ ...state, loginSuccess: false });

      if (res.error === "2FA-ENABLED") {
        //
        return;
      }

      toast({
        title: "Error",
        description: res.error,
        variant: "destructive",
        action: (
          //ToastAction for easy retry >
          <ToastAction onClick={login} altText="Try Again">
            Retry
          </ToastAction>
        ),
      });
      return;
    }

    setLoading(false);
    setState({ ...state, loginSuccess: true });
    route.push("/account/home"); //If login is successful route to-->account/home
  };

  return (
    <div className="w-full mt-5 flex items-center gap-3 flex-col px-2">
      <p className="text-2xl sm:text-xl text-center text-purple-500">
        Sign in with your Password.
      </p>
      <div className="w-full">
        <Input
          value={loginID}
          setValue={setLoginID}
          disabled={false}
          type="text"
          error={false}
          placeholder="Email or Phone Number"
        />
      </div>
      <div className="w-full flex flex-col">
        <Input
          value={password}
          setValue={setPassword}
          password_strength={password ? 100 : 0}
          disabled={false}
          type="password"
          error={false}
          placeholder="Password"
        />
        <Link
          href={"/auth/forgot-password"}
          className="text-[0.9rem] flex items-end justify-end underline text-purple-600"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        icon={<AiFillUnlock />}
        className="w-full h-[2.5rem]"
        name="Sign In"
        borderRadius={true}
        states={loading ? "loading" : undefined}
        disabled={
          password && loginID && !loading && password_strength ? false : true
        }
        varient="filled"
        onClick={login}
      />
    </div>
  );
};

export default PasswordLogin;
