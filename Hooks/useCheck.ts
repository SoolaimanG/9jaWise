export const useCheck = (
  value: string,
  type: "email" | "password" | "username"
) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  const usernameRegex = /^[a-zA-Z]+$/;

  let res = false;

  switch (type) {
    case "email":
      res = emailRegex.test(value);
      break;
    case "password":
      res = passwordRegex.test(value);
      break;
    case "username":
      res = usernameRegex.test(value);
      break;
    default:
      break;
  }

  return res;
};
