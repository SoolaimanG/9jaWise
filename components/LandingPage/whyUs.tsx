import Chip from "../chip";
import { BiCodeAlt } from "react-icons/bi";
import {
  MdOutlineSupportAgent,
  MdSystemSecurityUpdateGood,
} from "react-icons/md";
import { CgInsights } from "react-icons/cg";
import { GiTrade } from "react-icons/gi";
import { TbClockRecord } from "react-icons/tb";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import React from "react";

export const whyUsContent = [
  {
    id: 1,
    header: "Innovative Technology",
    icons: <BiCodeAlt />,
    reasons: [
      "We lead in innovation, providing an intuitive and advanced fintech platform, our technology enhances user experience and enables smarter financial decisions.",
    ],
  },
  {
    id: 2,
    header: "Exceptional Security",
    icons: <MdSystemSecurityUpdateGood />,
    reasons: [
      "Your financial data is treated with the utmost security, we use industry-standard encryption and continuous monitoring to ensure your information remains confidential.",
    ],
  },
  {
    id: 7,
    header: "24/7 Customer Support",
    icons: <MdOutlineSupportAgent />,
    reasons: [
      "Our dedicated support team is available 24/7, ready to assist you, your questions or concerns are addressed promptly, giving you peace of mind.",
    ],
  },
  {
    id: 3,
    header: "Personalized Financial Insights",
    icons: <CgInsights />,
    reasons: [
      "Gain a deeper understanding of your financial habits and goals with our personalized insights, we provide tailored recommendations and actionable advice to help you achieve your financial objectives faster.",
    ],
  },
  {
    id: 5,
    header: "Diverse Investment Opportunities",
    icons: <GiTrade />,
    reasons: [
      "Access a world of investment opportunities right at your fingertips, from stocks and bonds to cryptocurrencies and real estate, our platform simplifies the investment process, making it accessible to both beginners and seasoned investors.",
    ],
  },
  {
    id: 9,
    header: "Proven Track Record",
    icons: <TbClockRecord />,
    reasons: [
      "Join the ranks of thousands of satisfied users who have achieved their financial goals with us, our track record speaks for itself, demonstrating our commitment to helping you succeed.",
    ],
  },
];

const generateReasons = (reasons: string[]) => {
  return reasons.map((reason, i) => (
    <React.Fragment key={i}>{reason}</React.Fragment>
  ));
};

const WhyUs = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.5, // Set the threshold for when to trigger
  });

  const animationVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const container = {
    hidden: { opacity: 0, y: 10 },
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

  return (
    <section
      id="why-us"
      ref={ref}
      className="w-full px-5 h-screen pb-3 md:h-fit sm:h-fit mt-5"
    >
      <motion.div
        animate={inView ? "visible" : "hidden"}
        transition={{ delay: 0.5, stiffness: 0.3 }}
        variants={animationVariants}
        className="flex items-center justify-center flex-col gap-2"
      >
        <Chip varient="default" text="Why us" />
        <h2 className="text-3xl wordGradient">Choose us its the right way.</h2>
      </motion.div>
      <motion.div
        animate={inView ? "visible" : "hidden"}
        variants={container}
        className="w-full mt-5 grid grid-cols-3 md:grid-cols-1 grid-rows-2 gap-3 justify-evenly"
      >
        {whyUsContent.map((item, i) => (
          <motion.div
            variants={itemVarient}
            className={`w-full transition-all ${
              i % 2 === 0 ? "gradient-one" : "gradient-two"
            } text-gray-300 cursor-pointer hover:text-white rounded-md p-2`}
            key={item.id}
          >
            <span className="text-4xl">{item.icons}</span>
            <strong className="text-xl">{item.header}</strong>
            <li className="w-full flex flex-wrap">
              {generateReasons(item.reasons)}
            </li>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default WhyUs;
