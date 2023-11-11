"use client";

//----------->All Imports<-----------
import Personal from "@/components/Account/settings/personal";
import Report from "@/components/Account/settings/report";
import Security from "@/components/Account/settings/security";
import ChatBot from "@/components/Bot/chatBot";
import SheetComp from "@/components/sheet";
import { SheetClose } from "@/components/ui/sheet";
import { LiaLongArrowAltLeftSolid } from "react-icons/lia";
import React, { useRef, useState } from "react";
import { CgInsights } from "react-icons/cg";
import { FiUser } from "react-icons/fi";
import { GoReport } from "react-icons/go";
import { MdKeyboardArrowRight, MdSecurity } from "react-icons/md";
import { useStore } from "@/provider";
import FadeIn from "@/components/Animations/fadeIn";
import Button from "@/components/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Delete from "@/components/Account/settings/delete";

type settings_list_types = {
  name: "Personal" | "Security" | "Report" | "Customer Service";
  desc: string;
  icon: React.ReactElement;
};
const settings_list: settings_list_types[] = [
  {
    name: "Personal",
    desc: "Manage your personal information and profile settings",
    icon: <FiUser />,
  },
  {
    name: "Security",
    desc: "Update your security and privacy settings",
    icon: <MdSecurity />,
  },
  {
    name: "Report",
    desc: "View and generate reports for your account",
    icon: <CgInsights />,
  },
  {
    name: "Customer Service",
    desc: "Contact our customer service team for assistance",
    icon: <GoReport />,
  },
];

const Page = () => {
  const { is_darkmode, setUser } = useStore(); //is dark mode on?
  const [logout, setLogOut] = useState(false); //Track the state of logging out
  const router = useRouter();

  //Select depend on if darkmode is enabled
  const background = is_darkmode
    ? "headerBackground_dark"
    : "headerBackground_light";

  //log the user out of the current session
  const Logout = async () => {
    setLogOut(true);
    await signOut({ redirect: false }).then(() => {
      setLogOut(false);
      router.push("/auth/signin");
      setUser(null);
    });
  };

  return (
    <FadeIn className="w-full flex mt-5 flex-col gap-3">
      {settings_list.map((settings, index) => (
        <SheetComp
          key={index}
          header={
            <header
              className={`w-full z-10 ${background} sticky top-0 left-0 p-3 border-b-[1.2px] border-solid border-gray-200 cursor-pointer flex items-center`}
            >
              <SheetClose className="text-2xl">
                <LiaLongArrowAltLeftSolid />
              </SheetClose>
              <div className="w-full flex items-center justify-center">
                <p className="text-xl">{settings.name.toUpperCase()}</p>
              </div>
            </header>
          }
          button={
            settings.name === "Customer Service" ? (
              <ChatBot
                mode="CUSTOMER-SERVICE"
                button={
                  <div className="w-full cursor-pointer dark:text-gray-400 hover:dark:text-white text-gray-500 hover:text-slate-700 flex px-2 py-4 gap-2 border-solid transition-all ease-linear border-b-[1.5px] border-gray-400 dark:border-slate-500">
                    <span className="p-2 text-xl sm:text-[1.1rem] rounded-full">
                      {settings.icon}
                    </span>
                    <div className="w-full">
                      <div className="w-full flex items-center justify-between">
                        <p>{settings.name}</p>
                        <span>
                          <MdKeyboardArrowRight size={20} />
                        </span>
                      </div>
                      <span>{settings.desc}</span>
                    </div>
                  </div>
                }
              />
            ) : (
              <div className="w-full cursor-pointer dark:text-gray-400 hover:dark:text-white text-gray-500 hover:text-slate-700 flex px-2 py-4 gap-2 border-solid transition-all ease-linear border-b-[1.5px] border-gray-400 dark:border-slate-500">
                <span className="p-2 text-xl sm:text-[1.1rem] rounded-full">
                  {settings.icon}
                </span>
                <div className="w-full">
                  <div className="w-full flex items-center justify-between">
                    <p>{settings.name}</p>
                    <span>
                      <MdKeyboardArrowRight size={20} />
                    </span>
                  </div>
                  <span>{settings.desc}</span>
                </div>
              </div>
            )
          }
          children={
            <div className="w-full p-2">
              {settings.name === "Personal" && <Personal />}
              {settings.name === "Report" && <Report />}
              {settings.name === "Security" && <Security />}
            </div>
          }
        />
      ))}
      <div className="w-full flex mt-5 flex-col gap-2">
        <Button
          name="Logout"
          disabled={logout}
          varient="outlined"
          states={logout ? "loading" : undefined}
          onClick={Logout}
          className="w-full h-[2.5rem]"
        />
        <Delete />
      </div>
    </FadeIn>
  );
};

export default Page;
