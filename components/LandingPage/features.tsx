//----------->All Imports<-----------
import React, { useRef } from "react";
import DebitCard from "../debitCard";
import Chip from "../chip";
import { FaHandshake } from "react-icons/fa";
import { motion, useInView } from "framer-motion";
import Rings from "./rings";
import { RiSecurePaymentFill } from "react-icons/ri";
import { MdOutlineAccountBalanceWallet, MdSupportAgent } from "react-icons/md";

//Content for displaying features
const featuresOne = [
  {
    id: 1,
    icon: <FaHandshake />,
    header: "Free Sign Up",
    doc: "Sign up for free and get started with our platform.",
  },
  {
    id: 2,
    icon: <RiSecurePaymentFill />,
    header: "Secure Payments",
    doc: "Our platform ensures the security of your payments.",
  },
];
const featuresTwo = [
  {
    id: 1,
    icon: <MdOutlineAccountBalanceWallet />,
    header: "Free Account Number",
    doc: "Get a unique account number for free when you join us.",
  },
  {
    id: 2,
    icon: <MdSupportAgent />,
    header: "Customer Support",
    doc: "Our dedicated support team is here to assist you.",
  },
];

//Framer motion varients for animation
const container = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      stiffness: 1,
      delay: 0.75,
      staggerChildren: 0.5,
    },
  },
};
const item = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const Features = () => {
  const ref = useRef<HTMLElement | null>(null); //a useRef for access the element we want to track if it's in view or not
  const inView = useInView(ref, { once: true }); //Use inView is a framer motion hook that detects when an element enter view or leave [This is set to once because we want to observe just once]

  return (
    <motion.section
      id="features"
      ref={ref}
      className="w-full px-5 relative h-screen mt-10 md:h-fit sm:h-fit"
    >
      <div
        className="absolute inset-x-0 top-20 -z-10 transform-gpu overflow-hidden blur-3xl"
        aria-hidden="true"
      >
        <div
          className={`relative transition-all left-[calc(50%+3rem)] aspect-[1155/678] w-[60rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]`}
          style={{
            clipPath:
              "polygon(30% 0%, 90% 2%, 99% 55%, 88% 71%, 70% 100%, 16% 84%, 53% 50%, 18% 53%)",
          }}
        />
      </div>
      <div
        className="absolute left-0 right-[20%] w-full top-[30%] -z-10 transform-gpu overflow-hidden blur-3xl"
        aria-hidden="true"
      >
        <div
          className={`relative transition-all aspect-[1155/678] w-[30rem] bg-gradient-to-tr from-[#ff80b5] left-0 to-[#9089fc] opacity-30`}
          style={{
            clipPath:
              "polygon(30% 0%, 90% 2%, 99% 55%, 88% 71%, 70% 100%, 16% 84%, 53% 50%, 18% 53%)",
          }}
        />
      </div>
      <Rings position="top-[35%] left-[38%]" />
      <div className="w-full flex gap-2 flex-col items-center justify-center">
        <Chip text="Features" varient="default" />
        <p className="text-4xl sm:text-[1.6rem] wordGradient">Features</p>
        <span className="text-center sm:text-base">
          Rewards and benefit without the downside of 9jawise
        </span>
      </div>
      <div className="w-full h-full mt-5 md:flex-col sm:flex-col md:gap-5 sm:gap-5 flex gap-2 items-center justify-center">
        <motion.div
          animate={inView ? "visible" : "hidden"}
          variants={container}
          className="w-full flex flex-col gap-7"
        >
          {featuresOne.map((feature) => (
            <motion.div
              variants={item}
              key={feature.id}
              className={`w-full transition-all ease-linear delay-75 cursor-pointer flex items-start justify-start flex-col gap-2`}
            >
              <span className="p-2 text-white text-3xl gradient-one rounded-md">
                {feature.icon}
              </span>
              <p className="text-3xl text-left">{feature.header}</p>
              <p className="dark:text-gray-300 text-slate-600 text-left">
                {feature.doc}
              </p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          animate={inView ? "visible" : "hidden"}
          variants={container}
          className="w-full flex items-center  justify-center relative"
        >
          <motion.div
            variants={item}
            className="cursor-pointer md:hidden sm:hidden w-full"
          >
            <DebitCard
              type="glassmorphism"
              name="DevTobs"
              accountNumber={8088362315}
              balance={1000}
            />
          </motion.div>
          <motion.div
            variants={item}
            className="absolute md:relative sm:relative z-10 w-full rotate-90 bottom-[40%] md:bottom-0 md:left-0 sm:left-0 sm:bottom-0 left-[5%]"
          >
            <DebitCard
              type="color"
              name="DevTobs"
              accountNumber={8088362315}
              balance={1000}
            />
          </motion.div>
        </motion.div>
        <motion.div
          animate={inView ? "visible" : "hidden"}
          variants={container}
          className="w-full flex flex-col gap-7"
        >
          {featuresTwo.map((feature) => (
            <motion.div
              variants={item}
              key={feature.id}
              className={`w-full transition-all ease-linear delay-75 cursor-pointer items-end justify-end sm:items-start sm:justify-start flex md:items-start md:justify-start flex-col gap-2`}
            >
              <span className="p-2 text-white text-3xl gradient-one rounded-md">
                {feature.icon}
              </span>
              <p className="text-3xl text-right md:text-left sm:text-left">
                {feature.header}
              </p>
              <p className="dark:text-gray-300 text-slate-600 text-right md:text-left sm:text-left">
                {feature.doc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Features;
