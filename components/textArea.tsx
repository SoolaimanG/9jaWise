import React, { SetStateAction } from "react";

export type textAreaProps = {
  resize: boolean;
  height: 5 | 10 | 15;
  value: string;
  setValue: React.Dispatch<SetStateAction<string>>;
};

const TextArea = (props: textAreaProps) => {
  const { height, resize, value, setValue } = props;
  return (
    <textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={`w-full bg-transparent p-1 outline-none border-solid border-[1.5px] border-gray-400 rounded-sm ${
        resize && "resize-none"
      }`}
      name=""
      id=""
      rows={height}
    ></textarea>
  );
};

export default TextArea;
