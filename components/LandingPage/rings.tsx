import React from "react";

const Rings = ({ position }: { position: string }) => {
  const ringStyle =
    "border-[10px] border-solid border-purple-300 flex rounded-full items-center justify-center blur-md";

  return (
    <div className={`absolute ${position}`}>
      <div className={`${ringStyle} w-80 md:w-40 sm:w-20 md:h-40 sm:h-20 h-80`}>
        <div
          className={`${ringStyle} w-64 h-64 md:w-34 sm:w-14 md:h-34 sm:h-14`}
        >
          <div
            className={`${ringStyle} w-48 h-48 md:w-28 md:h-28 sm:h-10 sm:w-10`}
          />
        </div>
      </div>
    </div>
  );
};

export default Rings;
