import { useRef, useState } from "react";
import { motion } from "framer-motion";

export type swiperProps = {
  text: string;
  showIndicator?: boolean;
  functionCall: () => void;
  disable?: boolean;
};

const Swiper = (props: swiperProps) => {
  const { text, showIndicator, disable, functionCall } = props;

  const [x, setX] = useState<number>(0);
  const divRef = useRef<HTMLDivElement>();

  //DESKTOP
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      x === 0 ||
      e.clientX >= (divRef.current?.clientWidth as number) - 85 ||
      e.clientX <= 0
    ) {
      return;
    }

    setX(e.clientX);
  };

  //MOBILE(TOUCH DEVICES)
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const clientX = e.touches[0].clientX;

    if (
      x === 0 ||
      clientX >= (divRef.current?.clientWidth as number) - 85 ||
      clientX <= 0
    ) {
      return;
    }

    setX(clientX);
  };

  //On Cancel Swiper
  const handleTouchEnd = () => {
    if (x < (divRef.current?.clientWidth as number) - 90) {
      setX(0);
    } else {
      //Call function in here
      !disable && functionCall();
    }
  };

  //This is make sure that the swiper doent move by mistake [D-3]
  const mouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (
      e.clientX >= (divRef.current?.clientWidth as number) - 200 ||
      e.clientX <= 0
    ) {
      return;
    }

    setX(e.clientX);
  };

  //This works in hand with [D-3]
  const touchMove = (e: React.TouchEvent<HTMLButtonElement>) => {
    const clientX = e.touches[0].clientX;

    if (
      clientX >= (divRef.current?.clientWidth as number) - 200 ||
      clientX <= 0
    ) {
      return;
    }

    setX(clientX);
  };

  return (
    <motion.div
      transition={{ type: "spring", stiffness: 10 }}
      //@ts-ignore
      ref={divRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      className={`w-full bg-purple-500 relative px-1 py-2 rounded-xl`}
    >
      <button
        disabled={disable}
        onMouseMove={mouseMove}
        onTouchMove={touchMove}
        style={{ marginLeft: x }}
        className="w-1/4 bg-white disabled:cursor-not-allowed z-10 dark:bg-slate-700 dark:text-white flex items-center justify-center text-purple-600 transition-all ease-linear rounded-lg py-1"
      >
        {text}
      </button>
      {showIndicator && (
        <div className="w-full z-0 flex items-center justify-center absolute top-[25%] bottom-[25%] gap-2">
          <div className={`w-2 h-2 rounded-full bg-slate-500`} />
          <div
            className={`w-3 h-3 rounded-full ${
              x > 77 ? " bg-slate-300" : "bg-slate-500"
            }`}
          />
          <div
            className={`w-4 h-4 rounded-full ${
              x > 154 ? "bg-slate-200" : "bg-slate-500"
            }`}
          />
        </div>
      )}
    </motion.div>
  );
};

export default Swiper;
