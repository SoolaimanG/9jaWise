import { useStore } from "@/provider";
import GradientBG from "./gradientbg";
import Input from "../input";
import Button from "../button";
import DebitCard from "../debitCard";
import { motion } from "framer-motion";
import { useScreenSize } from "@/Hooks/useScreenSize";
import Rings from "./rings";

export const _UNCHANGEDDATA = [
  {
    id: 1,
    name: "Secure payment system",
  },
  {
    id: 2,
    number: "98%",
    name: "Free Sign up",
  },
  {
    id: 3,
    name: "Free account number",
  },
  {
    id: 4,
    name: "24/7 Customer support",
  },
];

const Hero = () => {
  const { is_darkmode } = useStore();
  const size = useScreenSize();

  const container = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <section
      id="home"
      className={`w-full overflow-hidden h-screen sm:h-fit md:h-fit relative`}
    >
      <GradientBG />
      <Rings position="top-[15%] right-0 -mr-[3rem] md:right-0 sm:right-0" />
      <div className="w-full px-5 md:pt-28 sm:pt-28 h-full flex gap-5 sm:flex-col md:flex-col">
        <div className="flex basis-[70%] w-full h-full items-center sm:basis-[100%] md:basis-[100%]">
          <div className="w-full flex flex-col gap-3">
            <motion.strong
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0, transition: { stiffness: 0.3 } }}
              className="relative line w-fit text-2xl sm:text-xl wordGradient"
            >
              For Everyone
            </motion.strong>
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl sm:text-3xl"
            >
              <motion.span
                initial={{ color: "#dbcfff", opacity: 0 }}
                animate={{ color: "#7609f8", opacity: 1 }}
                className="text-purple-700"
              >
                Seamless
              </motion.span>{" "}
              integration between business and payment
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl sm:text-xl font-bold"
            >
              Financial success is not an occurance{" "}
              <motion.span
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                className="cursor-pointer bg-purple-600 w-fit text-white px-3 py-1"
              >
                It&apos;s a habit
              </motion.span>
            </motion.p>
            <motion.span
              initial={{ opacity: 0, y: -20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0 },
              }}
            >
              Enjoy the ease of opening an online account,making transactions, &
              integrating all your financial needs. Doing all transaction in one
              platform.
            </motion.span>
            <motion.form
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { delay: 0.5 } }}
              className="flex w-full gap-3 items-center"
            >
              <Input
                value={""}
                className="w-[65%]"
                setValue={() => {}}
                type="email"
                placeholder="Email address"
                error={false}
                disabled={false}
              />
              <Button
                name="Get Started"
                varient="filled"
                disabled={false}
                className="w-1/5 h-[2.5rem] sm:w-[35%] md:w-[35%] sm:text-[0.9rem]"
                borderRadius={true}
                onClick={() => {}}
              />
            </motion.form>
          </div>
        </div>
        <div className="flex basis-[30%] h-full items-center justify-center w-full sm:basis-[100%] md:basis-[100%]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rotate-12 w-full md:mr-0 sm:mr-0 sm:rotate-0 md:rotate-0 mr-10"
          >
            <DebitCard
              type="glassmorphism"
              name="Babatunde Idris"
              accountNumber={9490268191}
              balance={500}
            />
            <span className="w-full flex items-end justify-end it">
              More than banking....
            </span>
          </motion.div>
        </div>
      </div>
      <motion.article
        initial="hidden"
        animate="visible"
        className={`w-full z-10 rotate-1 mb-3 overflow-hidden cursor-pointer absolute bottom-0 left-0 md:relative sm:relative md:mt-5 sm:mt-5 px-1 transition-all delay-75 h-fit flex items-center md:justify-normal md:gap-10 justify-between  ${
          is_darkmode ? "cardGlassmorphism_dark" : "cardGlassmorphism_light"
        }`}
      >
        {_UNCHANGEDDATA.map((d) => (
          <motion.div
            variants={item}
            className="flex w-full h-[5rem] justify-center sm:flex-col md:flex-col items-center gap-1"
            key={d.id}
          >
            <p
              className={`text-2xl md:text-4xl sm:text-4xl ${
                d.id % 2 !== 0 && "liner"
              } text-center sm:text-[0.9rem] md:text-[0.9rem] dark:text-gray-300  ${
                size.x < 700 && "linerAnimation"
              } w-fit text-slate-700`}
              style={{
                overflow: "hidden", // Prevent text overflow
                whiteSpace: "nowrap", // Prevent text wrapping
              }}
            >
              {d.name}
            </p>
          </motion.div>
        ))}
      </motion.article>
      <div className="w-full mb-5 absolute bg-purple-300 h-[5rem] bottom-0 -rotate-2" />
    </section>
  );
};

export default Hero;
