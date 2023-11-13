import Link from "next/link";
import Logo from "../logo";

const Header = ({ state }: { state: "SignIn" | "SignUp" }) => {
  return (
    <header className="w-full flex items-center justify-between">
      <Logo size="medium" color="purple" />
      <span className="text-gray-400 flex items-center gap-1">
        {" "}
        <span className="sm:hidden">
          {" "}
          {state === "SignIn" ? "Have an account?" : "Create account"}{" "}
        </span>
        <Link
          className="text-purple-600"
          href={state === "SignIn" ? "/auth/signin" : "/auth/signup"}
        >
          {state}
        </Link>
      </span>
    </header>
  );
};

export default Header;
