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
    number: "15",
    name: "years of experience",
  },
  {
    id: 2,
    number: "98%",
    name: "customer satisfaction",
  },
  {
    id: 3,
    number: "4k",
    name: "new users per week",
  },
  {
    id: 4,
    number: "100%",
    name: "free service",
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
                It's a habit
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
        variants={container}
        className={`w-full absolute bottom-0 left-0 md:relative sm:relative md:mt-5 sm:mt-5 px-1 transition-all delay-75 py-4 h-fit flex items-center justify-between  ${
          is_darkmode ? "cardGlassmorphism_dark" : "cardGlassmorphism_light"
        }`}
      >
        {_UNCHANGEDDATA.map((d) => (
          <motion.div
            variants={item}
            className="flex w-full justify-center sm:flex-col md:flex-col items-center gap-1"
            key={d.id}
          >
            <h2 className="text-4xl sm:text-lg md:text-2xl">{d.number}</h2>
            <p className="text-xl text-center sm:text-[0.9rem] md:text-[0.9rem] dark:text-gray-300 text-slate-700">
              {(size.x as number) <= 280 ? d.name.split(" ")[0] : d.name}
            </p>
          </motion.div>
        ))}
      </motion.article>
    </section>
  );
};

export default Hero;
