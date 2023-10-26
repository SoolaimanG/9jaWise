import { useEffect, useState } from "react";

export const useCheck = (
  value: string,
  type: "email" | "password" | "username"
) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  const usernameRegex = /^[a-zA-Z]+$/;

  let [res, setRes] = useState(false);

  useEffect(() => {
    switch (type) {
      case "email":
        setRes(emailRegex.test(value));
        break;
      case "password":
        setRes(passwordRegex.test(value));
        break;
      case "username":
        setRes(usernameRegex.test(value));
        break;
      default:
        break;
    }
  }, [value]);

  return res;
};
