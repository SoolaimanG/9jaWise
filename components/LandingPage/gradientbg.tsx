import { motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";

const GradientBG = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const ref2 = useRef<HTMLDivElement | null>(null);
  const [cor, setCor] = useState(0);

  const width = ref.current?.clientWidth;

  // Wait for the component to settle before starting the animation
  useLayoutEffect(() => {
    const timer = setInterval(() => {
      const randomPosition = width ? Math.floor(Math.random() * width) : 10;

      setCor(-randomPosition);
    }, 5000);

    return () => clearInterval(timer);
  }, [width]);

  return (
    <>
      <div
        ref={ref}
        className="absolute inset-x-0 top-20 -z-10 transform-gpu overflow-hidden blur-3xl"
        aria-hidden="true"
      >
        <motion.div
          animate={{ transition: { delay: 0.5, stiffness: 0.5 }, x: cor }}
          className={`relative transition-all left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]`}
          style={{
            clipPath:
              "polygon(30% 0%, 90% 2%, 99% 55%, 88% 71%, 70% 100%, 16% 84%, 53% 50%, 18% 53%)",
          }}
        ></motion.div>
      </div>
      <div
        ref={ref2}
        className="absolute sm:hidden md:hidden block bottom-0 left-0 -z-10 transform-gpu overflow-hidden blur-3xl"
        aria-hidden="true"
      >
        <motion.div
          animate={{
            transition: { delay: 0.5, stiffness: 0.5 },
          }}
          className={`relative transition-all left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]`}
          style={{
            clipPath:
              "polygon(30% 0%, 90% 2%, 99% 55%, 88% 71%, 70% 100%, 16% 84%, 53% 50%, 18% 53%)",
          }}
        ></motion.div>
      </div>
    </>
  );
};

export default GradientBG;
