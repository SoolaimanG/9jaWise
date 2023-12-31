//----------------->All Imports<----------------
import TextStreamer from "@/Functions/TSX/textStream";
import Chip from "../chip";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { MdKeyboardArrowDown } from "react-icons/md";
import Rings from "./rings";
import FadeIn from "../Animations/fadeIn";
import SlideFromAbove from "../Animations/slideFromAbove";
import SlideFromBelow from "../Animations/slideFromBelow";
import { useScreenSize } from "@/Hooks/useScreenSize";

//How its works content
export const howItWorksContent = [
  {
    step: "Signup",
    context:
      "Begin your financial journey by creating an account, agreeing to our terms and conditions, and verifying your email. It's your first step toward seamless financial management.",
  },
  {
    step: "Confirm Your Identity",
    context:
      "We prioritize security. Complete the KYC process, verify your residential address, and confirm your identity to ensure your transactions are safe and compliant.",
  },
  {
    step: "Fund Your Account",
    context:
      "Link your bank account effortlessly, verify it with small deposits, deposit funds at your convenience, and explore alternative funding options to tailor your financial strategy.",
  },
  {
    step: "Start Making Transfers",
    context:
      "Unlock a world of financial possibilities. Explore our app's features, choose your preferred transaction type, confidently confirm your transactions, and easily track your financial history. It's your gateway to hassle-free financial management.",
  },
];

//Framer motion varient
const container = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
};
const itemVarient = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const HowItWorks = () => {
  const [currentState, setCurrentState] = useState<1 | 2 | 3 | 4 | 0>(0);
  const ref = useRef<HTMLElement | null>(null); //a useRef for access the element we want to track if it's in view or not
  //Use react-intersection-observer to know when an element enter view
  const inView = useInView(ref, { once: true }); //Use inView is a framer motion hook that detects when an element enter view or leave [This is set to once because we want to observe just once]

  const screen = useScreenSize();

  //Opening the accordion according to the on clicked
  const handleOpen = (id: 1 | 2 | 3 | 4 | 0) => {
    //
    setCurrentState(id === currentState ? 0 : id);
  };
  return (
    <motion.section
      ref={ref}
      id="how-it-works"
      className="w-full overflow-hidden sm:px-3 px-5 mt-10 h-screen md:h-fit sm:h-fit relative md:pb-3 sm:pb-3"
    >
      <Rings position="top-[20%] left-0 -ml-[5rem]" />
      <Rings position="top-[35%] right-0 -mr-[5rem]" />
      <motion.div
        animate={
          inView
            ? { opacity: 1, x: 0, transition: { delay: 0.75 } }
            : { opacity: 0, x: 100 }
        }
        className="w-full flex flex-col gap-2 items-center justify-center"
      >
        <SlideFromAbove>
          <Chip text="Hot it works" varient="default" />
        </SlideFromAbove>
        <FadeIn>
          <h2 className="text-center text-3xl sm:text-2xl wordGradient">
            Easy as ABC...
          </h2>
        </FadeIn>
      </motion.div>
      <SlideFromBelow className="w-full md:mt-10 flex md:flex-col-reverse h-full items-center justify-center flex-row sm:flex-col-reverse gap-7">
        <motion.div
          animate={
            inView
              ? { opacity: 1, x: 0, transition: { delay: 0.75 } }
              : { opacity: 0, x: 10 }
          }
          className="w-full flex basis-[50%] flex-col sm:gap-5 gap-8 md:basis-[100%] sm:basis-[100%]"
        >
          <motion.p className="text-xl">
            {"Premium wallet for everyone".toUpperCase()}
          </motion.p>
          <h2 className="text-7xl wordGradient sm:text-5xl">
            Make banking easier with Us
          </h2>
          <Link
            href={"/auth/signup"}
            className="w-full py-3 text-white gradient-one rounded-sm text-center"
          >
            Sign Up
          </Link>
        </motion.div>
        <div className="w-full flex flex-col gap-5 basis-[50%] md:basis-[100%] sm:basis-[100%]">
          <motion.div
            animate={
              inView
                ? { opacity: 1, x: 0, transition: { delay: 0.75 } }
                : { opacity: 0, x: 10 }
            }
            className="text-3xl sm:text-[1.6rem] text-center w-full"
          >
            Four easy steps involve in opening an account
          </motion.div>
          <motion.div
            animate="visible"
            initial="hidden"
            variants={container}
            className="w-full transition-all delay-75 ease-linear flex flex-col gap-5"
          >
            {howItWorksContent.map((content, i) => (
              <motion.div key={i} className="w-full" variants={itemVarient}>
                <motion.div
                  animate={
                    inView
                      ? { opacity: 1, x: 0, transition: { delay: 0.75 } }
                      : { opacity: 0, x: 10 }
                  }
                  exit={{ opacity: 0, x: 10 }}
                  className="flex flex-col gap-2"
                >
                  <div
                    //@ts-ignore
                    onClick={() => handleOpen(i + 1)}
                    className="w-full cursor-pointer flex items-center justify-between"
                  >
                    <h2
                      className={`text-xl ${
                        currentState === i + 1 && "text-purple-700"
                      } hover:text-purple-700 font-semibold`}
                    >
                      {content.step}
                    </h2>

                    <span
                      className={`${
                        currentState === i + 1 && "rotate-180 transition-all"
                      }`}
                    >
                      <MdKeyboardArrowDown size={25} />
                    </span>
                  </div>
                  <AnimatePresence>
                    {i + 1 === currentState && (
                      <motion.div
                        key={i + 1}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          transition: { type: "tween", delay: 0.2 },
                          height:
                            screen.x > 290 && screen.x < 700
                              ? 220
                              : screen.x < 290
                              ? 245
                              : 110,
                        }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-lg"
                      >
                        <TextStreamer text={content.context} speed={20} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="w-full h-[2px] bg-gray-300 rounded-sm" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SlideFromBelow>
    </motion.section>
  );
};

export default HowItWorks;
