"use client";

import Loaders, { statusProps } from "./loaders";

type buttonProps = {
  name: string;
  states?: statusProps;
  disabled: boolean;
  varient: "filled" | "outlined" | "danger" | "warning";
  hover?: boolean;
  borderRadius?: boolean;
  icon?: React.ReactElement;
  className?: string;
  onClick: () => void;
};

const Button = (props: buttonProps) => {
  const {
    name,
    states,
    disabled,
    varient,
    borderRadius,
    icon,
    hover,
    className,
    onClick,
  } = props;

  const hoverTypes = {
    filled: "filled rounded-sm hover:text-purple-600",
    outlined: "outline bg-purple-600 rounded-sm hover:text-white",
    warning: "hover:bg-yellow-600",
    danger: "hover:bg-red-600",
  };

  return (
    <button
      disabled={disabled}
      className={`${
        hover && hoverTypes[varient]
      } relative flex items-center justify-center gap-2 font-semibold disabled:cursor-not-allowed ${className} disabled:bg-gray-300 disabled:text-gray-500 ${
        borderRadius && "rounded-md"
      } ${
        varient === "filled"
          ? "text-white bg-purple-600"
          : varient === "outlined"
          ? `bg-white dark:bg-slate-700 text-purple-600 border border-purple-600`
          : varient === "danger"
          ? "bg-red-500 text-white"
          : "bg-yellow-500 text-white"
      }`}
      onClick={onClick}
    >
      {states && (
        <Loaders
          is_promise={true}
          status={states}
          width="10"
          addBackground={false}
        />
      )}
      {!states && icon && <span>{icon}</span>}
      {name && <span className="z-10">{name}</span>}
    </button>
  );
};

export default Button;
