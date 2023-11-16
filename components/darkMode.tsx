"use client";

import { useStore } from "@/provider";
import { useState } from "react";
import { BsSun } from "react-icons/bs";
import { CiDark } from "react-icons/ci";

export type darkModeProps = {
  color: "w" | "p";
  position: "v" | "h";
  hide_name: boolean;
};

const DarkMode = (props: darkModeProps) => {
  /**
   * We are destructuring the props to get the color[color is only white and purple] and position[This position is vertical and horizonatl] and hide_name[If we want to render only icons]
   */
  const { color, position, hide_name } = props;

  // First check if the window properties are available
  const checkExistance = typeof window !== "undefined"; // Check if the window object exists

  // Check if the theme is stored in localStorage
  const storedTheme = checkExistance ? localStorage.getItem("theme") : null;

  // Set the initial mode based on storedTheme or default to "dark"
  const initialMode = storedTheme || (checkExistance ? "dark" : "light");

  const [mode, setMode] = useState<"dark" | "light">(
    initialMode as "dark" | "light"
  );

  const { setIs_darkmode, is_darkmode } = useStore(); // Zustand State Management

  const handleClick = () => {
    if (mode === "light") {
      localStorage.theme = "dark";
      window.document.documentElement.classList.add("dark"); // Set the HTML classname to dark if it's on light mode [D-1]
      setMode("dark");
    } else if (mode === "dark") {
      localStorage.theme = "light";
      window.document.documentElement.classList.remove("dark"); // Opposite of D-1
      setMode("light");
    }

    setIs_darkmode(!is_darkmode);
  };

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
