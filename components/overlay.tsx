import { useStore } from "@/provider";
import React from "react";

export type overlayProps = {
  className?: string;
  children?: React.ReactNode;
};

const Overlay = ({ children, className }: overlayProps) => {
  const { is_darkmode } = useStore();
  return (
    <div
      className={`absolute z-20 ${
        is_darkmode ? "overlay_bg_dark" : "overlay_bg_light"
      } top-0 left-0 w-screen ${className} h-screen`}
    >
      {children}
    </div>
  );
};

export default Overlay;
