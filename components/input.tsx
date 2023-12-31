import React, { SetStateAction, useState } from "react";
import Loaders from "./loaders";
import ProgressBars, { passwordStrength } from "./progressBars";

type inputProps = {
  value: string | number;
  type: "text" | "number" | "password" | "email";
  placeholder?: string;
  is_loading?: boolean;
  error?: boolean;
  disabled?: boolean;
  max?: number;
  countChar?: boolean;
  color?: boolean;
  password_strength?: passwordStrength;
  className?: string;
  setValue: React.Dispatch<SetStateAction<string | number>>;
  label?: string;
};

/**
 * Renders an input field with various features such as value, placeholder, loading state, error state, disabled state, character count, and password strength indicator.
 * @param props - The input field props.
 * @returns The rendered input field.
 */
const Input = (props: inputProps) => {
  const {
    value,
    placeholder,
    is_loading,
    error,
    disabled,
    max,
    color,
    type,
    password_strength,
    setValue,
    className,
    label,
  } = props;

  /**
   * Handles the change event of the input field.
   * @param e - The change event.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (type === "number") {
      setValue(isNaN(Number(inputValue)) ? 0 : Number(inputValue));
    } else {
      setValue(inputValue);
    }
  };

  const [focused, setFocused] = useState(false);

  return (
    <div className={`${label && "flex flex-col gap-1"} w-full`}>
      {label && (
        <label className="w-full text-gray-400 dark:text-gray-300 flex items-start justify-start">
          {label}
        </label>
      )}
      <div
        onBlur={() => setFocused(false)}
        onClick={() => setFocused(true)}
        className={`px-1 w-full flex gap-1 ${
          disabled && "bg-gray-100 text-gray-500 border-gray-500"
        } items-center border ${
          error
            ? "bg-red-100 text-red-600 border-red-500"
            : ` ${focused ? "border-purple-500" : "border-gray-500"} ${
                color ? "bg-purple-100" : "bg-white dark:bg-slate-700"
              }`
        } rounded-md`}
      >
        <input
          maxLength={max}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder || ""}
          className={`outline-none pl-1 ${className} disabled:cursor-not-allowed bg-transparent w-full h-[2.5rem] ${
            color
              ? "dark:text-purple-600"
              : `${error ? "text-red-500" : "dark:text-white"}`
          } rounded-md`}
          type={type === "number" ? "text" : type}
        />
        {is_loading && <Loaders width="10" addBackground={false} />}
        {!is_loading && type === "password" && (
          //@ts-ignore
          <ProgressBars width="20px" value={password_strength} />
        )}
      </div>
      {max && (
        <span className="pl-1 w-full flex items-start justify-start">
          {value.toString().length}/{max}
        </span>
      )}
    </div>
  );
};

export default Input;
