import React, { useState } from "react";
import Input from "../input";
import Button from "../button";
import Link from "next/link";
import { AiFillUnlock } from "react-icons/ai";
import { signIn, useSession } from "next-auth/react";
import { toast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";
import { useRouter } from "next/navigation";

const PasswordLogin = () => {
  const [state, setState] = useState({
    invalidPassword: false,
    invalidCredentials: false,
    loginSuccess: false,
  });
  const [loginID, setLoginID] = useState<string | number>("");
  const [password, setPassword] = useState<string | number>("");
  const [loading, setLoading] = useState(false);

  const route = useRouter();

  const login = async () => {
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      callbackUrl: "/",
      loginID: loginID,
      otp: "",
      password: password,
      loginMode: "password",
    });

    if (res?.error) {
      setLoading(false);
      setState({ ...state, loginSuccess: false });
      toast({
        title: "Error",
        description: res.error,
        variant: "destructive",
        action: (
          <ToastAction onClick={login} altText="Try Again">
            Retry
          </ToastAction>
        ),
      });
      return;
    }

    setLoading(false);
    setState({ ...state, loginSuccess: true });
    route.push("/account/home");
  };

  return (
    <div className="w-full mt-5 flex items-center gap-3 flex-col px-2">
      <p className="text-2xl sm:text-xl text-center text-purple-500">
        Sign in with your Password.
      </p>
      <Input
        value={loginID}
        setValue={setLoginID}
        disabled={false}
        type="text"
        error={false}
        placeholder="Email or Phone Number"
      />
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
        disabled={password && loginID && !loading ? false : true}
        varient="filled"
        onClick={login}
      />
    </div>
  );
};

export default PasswordLogin;
