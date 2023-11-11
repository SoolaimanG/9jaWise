import Provider from "@/Functions/TSX/sessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";
import EncryptButton from "@/components/Account/encrypted";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);
  return (
    <Provider session={session}>
      <div className="w-screen overflow-hidden h-screen flex">
        <div className="w-full flex overflow-auto flex-col gap-3 basis-[40%] md:basis-[100%] sm:basis-[100%]">
          <div className="border-b-[1.2px] py-3 px-1 dark:bg-slate-600 bg-gray-50 w-full flex justify-center items-center border-solid border-gray-300">
            <p className="text-3xl md:hidden sm:hidden text-center w-full">
              KYC
            </p>
            <div className="hidden text-purple-700 md:block sm:block">
              <EncryptButton target_text="Complete your KYC" />
            </div>
          </div>
          {children}
        </div>
        <div className="w-full signUpGradient z-10 items-start px-3 justify-center flex-col gap-2 flex basis-[60%] md:hidden sm:hidden">
          <p className="text-4xl text-purple-800 liner">Welcome to 9jaWise</p>
          <span className="text-xl text-white md:hidden sm:hidden">
            <EncryptButton target_text="We've implemented robust security measures to protect your details" />
          </span>
        </div>
      </div>
    </Provider>
  );
};

export default Layout;
