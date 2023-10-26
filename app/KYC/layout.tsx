import type { Metadata } from "next";

//Know your customer verification!
export const metadata: Metadata = {
  title: "KYC verification",
  description: "Create account for user and knowing who your users are",
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-screen h-screen flex">
      <div className="w-full flex flex-col gap-3 basis-[40%] md:basis-[100%] sm:basis-[100%]">
        <div className="border-b-[1.2px] py-3 px-1 bg-gray-50 w-full flex justify-center items-center border-solid border-gray-300">
          <p className="text-3xl text-center w-full">KYC</p>
        </div>
        {children}
      </div>
      <div className="w-full signUpGradient z-10 items-start px-3 justify-center flex-col gap-2 flex basis-[60%] md:hidden sm:hidden">
        <p className="text-4xl text-purple-800 liner">Welcome to 9jaWise</p>
        <span className="text-xl">
          Complete your KYC verification to access all features
        </span>
      </div>
    </div>
  );
};

export default Layout;
