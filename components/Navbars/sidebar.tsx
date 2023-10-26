"use client";

import Logo from "../logo";
import { TbSmartHome } from "react-icons/tb";
import { IoWalletOutline } from "react-icons/io5";
import { GoHistory } from "react-icons/go";
import { BsGear } from "react-icons/bs";
import DarkMode from "../darkMode";
import Link from "next/link";
import { useGetId } from "@/Hooks/useGetId";

const sidebar = [
  {
    name: "Home",
    icon: <TbSmartHome />,
    path: "/home",
  },
  {
    name: "Wallet",
    icon: <IoWalletOutline />,
    path: "/wallet",
  },
  {
    name: "Records",
    icon: <GoHistory />,
    path: "/transactions",
  },
  {
    name: "Settings",
    icon: <BsGear />,
    path: "/settings",
  },
];

const Sidebar = () => {
  const path = useGetId(2);

  return (
    <div className="w-[23%] md:w-full md:bottom-0 sm:bottom-0 bg-white dark:bg-slate-950 fixed h-full md:h-fit sm:h-fit lg:left-0 2xl:left-0">
      <div className="w-full h-full flex py-5 md:py-1 sm:py-1 flex-col items-center justify-between">
        <div className="w-full md:hidden sm:hidden flex flex-col gap-2 items-center">
          <Logo color="purple" size="medium" />
        </div>
        <div className="md:w-full md:items-center sm:items-center sm:w-full flex flex-col md:justify-evenly sm:justify-evenly md:flex-row sm:flex-row gap-5">
          {sidebar.map((_) => (
            <Link
              href={`/account${_.path}`}
              passHref
              className={`flex w-full md:justify-center cursor-pointer p-1 md:flex-col sm:text-flex-col md:items-center hover:text-purple-600 hover:font-semibold rounded-md ${
                _.name.toLowerCase() === path
                  ? "text-purple-600 font-semibold"
                  : "text-gray-500"
              } items-center md:gap-1 sm:gap-1 gap-2`}
              key={_.name}
            >
              <span className="text-[1.5rem]">{_.icon}</span>
              <p className="text-xl md:text-lg sm:text-lg">{_.name}</p>
            </Link>
          ))}
        </div>
        <div className="md:hidden sm:hidden">
          <DarkMode color="p" position="h" hide_name={false} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
