import React, { SetStateAction } from "react";

export type textAreaProps = {
  resize: boolean;
  height: 5 | 10 | 15;
  value: string;
  placeholder?: string;
  setValue: React.Dispatch<SetStateAction<string>>;
};

const TextArea = (props: textAreaProps) => {
  const { height, resize, placeholder, value, setValue } = props;
  return (
    <textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={`w-full focus:border focus:border-purple-500 bg-transparent p-1 outline-none border-solid border-[1.5px] border-gray-400 rounded-sm ${
        !resize && "resize-none"
      }`}
      name=""
      id=""
      placeholder={placeholder}
      rows={height}
    ></textarea>
  );
};

export default TextArea;
