import TextStreamer from "@/Functions/TSX/textStream";
import Chip from "../chip";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useInView } from "react-intersection-observer";
import Rings from "./rings";

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

const HowItWorks = () => {
  const [currentState, setCurrentState] = useState<1 | 2 | 3 | 4 | 0>(0);
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const handleOpen = (id: 1 | 2 | 3 | 4 | 0) => {
    //
    setCurrentState(id === currentState ? 0 : id);
  };
  return (
    <motion.section
      ref={ref}
      id="how-it-works"
      className="w-full overflow-hidden px-5 mt-20 h-screen md:h-fit sm:h-fit relative md:pb-3 sm:pb-3"
    >
      <Rings position="top-[20%] left-0 -ml-[5rem]" />
      <Rings position="top-[35%] right-0 -mr-[5rem]" />
      <motion.div
        animate={
          inView
            ? { opacity: 1, x: 0, transition: { delay: 0.75 } }
            : { opacity: 0, x: 10 }
        }
        className="w-full flex flex-col gap-2 items-center justify-center"
      >
        <Chip text="Hot it works" varient="default" />
        <h2 className="text-center text-3xl sm:text-2xl wordGradient">
          Easy as ABC...
        </h2>
      </motion.div>
      <div className="w-full md:mt-10 flex md:flex-col-reverse h-full items-center justify-center flex-row sm:flex-col-reverse gap-3">
        <motion.div
          animate={
            inView
              ? { opacity: 1, x: 0, transition: { delay: 0.75 } }
              : { opacity: 0, x: 10 }
          }
          className="w-full flex basis-[50%] flex-col gap-5 md:basis-[100%] sm:basis-[100%]"
        >
          <motion.p className="text-xl wordGradient">
            {"Premium wallet for everyone".toUpperCase()}
          </motion.p>
          <h2 className="text-7xl sm:text-5xl">Make banking easier with Us</h2>
          <Link
            href={"/"}
            className="w-full py-3 gradient-one rounded-sm text-center"
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
            className="text-3xl text-center w-full"
          >
            Four easy steps involve in opening an account
          </motion.div>
          <motion.div className="w-full transition-all delay-75 ease-linear flex flex-col gap-5">
            {howItWorksContent.map((content, i) => (
              <AnimatePresence>
                <motion.div
                  animate={
                    inView
                      ? { opacity: 1, x: 0, transition: { delay: 0.75 } }
                      : { opacity: 0, x: 10 }
                  }
                  className="flex flex-col gap-2"
                  key={i}
                >
                  <div
                    //@ts-ignore
                    onClick={() => handleOpen(i + 1)}
                    className="w-full cursor-pointer flex items-center justify-between"
                  >
                    <h2
                      className={`text-xl ${
                        currentState === i + 1 && "text-purple-700"
                      } font-semibold`}
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
                  {i + 1 === currentState && (
                    <motion.div
                      key={i + 1}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.15 }}
                      className="text-lg transition-all delay-75 ease-linear"
                    >
                      <TextStreamer
                        text={content.context}
                        speed={100}
                        isDone={false}
                      />
                    </motion.div>
                  )}
                  <div className="w-full h-[2px] bg-gray-300 rounded-sm" />
                </motion.div>
              </AnimatePresence>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default HowItWorks;
