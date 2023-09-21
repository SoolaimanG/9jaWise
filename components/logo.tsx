import React from "react";

const Logo = ({
  size,
  color,
}: {
  size: "small" | "medium" | "large" | "extraLarge";
  color: "white" | "purple";
}) => {
  const textSizes = {
    small: ["text-lg sm:text-md", "text-2xl sm:text-xl"],
    medium: ["text-2xl sm:text-xl", "text-4xl sm:text-2xl"],
    large: ["text-4xl sm:text-2xl", "text-6xl sm:text-3xl"],
    extraLarge: ["text-6xl sm:text-2xl", "text-8xl sm:text-3xl"],
  };
  return (
    <div
      className={`w-full cursor-pointer flex ${
        color === "white" ? "text-white" : "text-purple-500"
      }`}
    >
      <span
        className={`logoFont ${textSizes[size][0]} flex flex-col items-end justify-end`}
      >
        9ja
      </span>
      <strong className={`${textSizes[size][1]}`}>WISE</strong>
    </div>
  );
};

export default Logo;
