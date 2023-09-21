"use client";

import { useStore } from "@/provider";
import { useEffect, useState } from "react";
import { BsSun } from "react-icons/bs";
import { CiDark } from "react-icons/ci";

export type darkModeProps = {
  color: "w" | "p";
  position: "v" | "h";
  hide_name: boolean;
};

const DarkMode = (props: darkModeProps) => {
  const { color, position, hide_name } = props;
  const checkExistance = typeof window !== "undefined"; //Using this because of the nature of NEXTJS(window not defined)
  const [mode, setMode] = useState<"dark" | "light" | undefined>(
    //@ts-ignore
    checkExistance ? localStorage.getItem("theme") | "light" : undefined
  );
  const { setIs_darkmode } = useStore();

  const handleClick = () => {
    setMode(mode === "dark" ? "light" : "dark");

    if (mode === "light") {
      localStorage.theme = "dark";
      window.document.documentElement.classList.add("dark"); //Set the HTML classname to dark if its on light mode [D-1]
      setIs_darkmode(true);
    } else if (mode === "dark") {
      localStorage.theme = "light";
      window.document.documentElement.classList.remove("dark"); //Opposite of D-1
      setIs_darkmode(false);
    }
  };

  useEffect(() => {
    if (!checkExistance) {
      localStorage.setItem("theme", "light");
      setIs_darkmode(false);
      return;
    }

    setMode(localStorage.theme);
    if (localStorage.theme === "light" || localStorage.theme === undefined) {
      window.document.documentElement.classList.remove("dark");
      setIs_darkmode(false);
    } else {
      window.document.documentElement.classList.add("dark");
      setIs_darkmode(true);
    }
  }, []);

  return (
    <div
      className={`w-fit rounded-sm p-[3px] ${
        color === "w"
          ? "bg-gray-100 dark:bg-slate-600 text-purple-500 dark:text-gray-200"
          : "bg-purple-500 text-white"
      } flex items-center gap-2 ${position === "v" ? "flex-col" : "flex-row"}`}
    >
      <button
        onClick={() => {
          handleClick();
        }}
        className={`w-full flex items-center gap-1 px-2 py-1 rounded-sm ${
          mode === "light" &&
          `bg-purple-500 transition-all delay-200 ease-in-out ${
            color === "p" ? "bg-white text-purple-500" : "text-white"
          }`
        }`}
      >
        <BsSun />
        {!hide_name && "Light"}
      </button>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-1 px-2 py-1 rounded-sm ${
          mode === "dark" &&
          `bg-purple-500 transition-all delay-150 ease-in-out ${
            color === "p" ? "bg-white text-purple-500" : "text-white"
          }`
        }`}
      >
        <CiDark />
        {!hide_name && "Dark"}
      </button>
    </div>
  );
};

export default DarkMode;
