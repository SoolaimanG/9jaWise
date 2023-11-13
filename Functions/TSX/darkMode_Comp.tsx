"use client";

import React, { useEffect } from "react";
import { useStore } from "@/provider";

const DarkModeComponent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { setIs_darkmode, is_darkmode } = useStore();
  const isWindowAvailable = typeof window !== "undefined";

  useEffect(() => {
    // use client - Checking if the window is available on the client side
    if (!isWindowAvailable) {
      localStorage.setItem("theme", "light");
      setIs_darkmode(false);
      return;
    }

    // setMode(localStorage.theme);
    if (localStorage.theme === "light" || localStorage.theme === undefined) {
      window.document.documentElement.classList.add("light");
      setIs_darkmode(false);
    } else {
      window.document.documentElement.classList.add("dark");
      setIs_darkmode(true);
    }
  }, [isWindowAvailable, is_darkmode]);

  return <React.Fragment>{children}</React.Fragment>;
};

export default DarkModeComponent;
