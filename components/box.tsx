import React from "react";

export type boxProps = {
  radius: "s" | "m" | "lg";
  content: React.ReactNode;
};

const Box = (props: boxProps) => {
  const { radius, content } = props;
  return (
    <div
      className={`w-fit bg-gray-100 dark:text-white dark:bg-slate-700 shadow-md ${
        radius === "s"
          ? "rounded-sm"
          : radius === "m"
          ? "rounded-md"
          : "rounded-lg"
      }`}
    >
      {content}
    </div>
  );
};

export default Box;
