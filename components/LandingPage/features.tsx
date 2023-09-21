import React from "react";
import DebitCard from "../debitCard";
import Chip, { varientTypes } from "../chip";
import { useScreenSize } from "@/Hooks/useScreenSize";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export type contentProps = {
  id: number;
  style: string;
  content: string;
  varient: varientTypes | "default" | "success";
  description?: string;
};

export const featureContent: contentProps[] = [
  {
    id: 1,
    style: "top-[60%] left-[15%]",
    content: "Bill Payment",
    varient: "default",
    description:
      "Easily pay your bills, from utilities to credit cards, all in one place.",
  },
  {
    id: 2,
    style: "top-[80%] right-[25%]",
    content: "Fast Transactions",
    varient: "success",
    description:
      "Experience lightning-fast transactions with our high-speed payment processing.",
  },
  {
    id: 3,
    style: "top-[13%] left-[10%]",
    content: "Tax Services",
    varient: "success",
    description:
      "Simplify tax season with integrated tax services and filing assistance.",
  },
  {
    id: 4,
    style: "top-[20%] right-[25%]",
    content: "Mobile Accessibility",
    varient: "default",
    description:
      "Access your finances and make payments on the go with our mobile app.",
  },
  {
    id: 5,
    style: "top-[33%] left-[10%]",
    content: "Notifications",
    varient: "error",
    description:
      "Stay informed with real-time notifications about your account activity.",
  },
  {
    id: 6,
    style: "top-[30%] right-[15%]",
    content: "Fraud Detection",
    varient: "error",
    description:
      "Our advanced fraud detection systems keep your assets safe at all times.",
  },
  {
    id: 7,
    style: "top-[45%] left-[19%]",
    content: "Digital Wallet",
    varient: "default",
    description:
      "Store and manage your funds securely with our digital wallet feature.",
  },
  {
    id: 8,
    style: "top-[70%] right-[25%]",
    content: "Rewards Program",
    varient: "success",
    description:
      "Earn rewards and cashback on your transactions and investments.",
  },
  {
    id: 9,
    style: "top-[90%] left-0 ml-[15rem]",
    content: "Savings Goals",
    varient: "warning",
    description:
      "Set savings goals and track your progress to achieve your financial dreams.",
  },
  {
    id: 10,
    style: "top-[15%] left-[30%]",
    content: "Investment Insights",
    varient: "success",
    description:
      "Get valuable insights and recommendations for your investment portfolio.",
  },
  {
    id: 11,
    style: "top-[38%] right-[20%]",
    content: "Expense Tracking",
    varient: "warning",
    description:
      "Effortlessly track your expenses and gain control over your spending.",
  },
  {
    id: 12,
    style: "top-[70%] left-[5%]",
    content: "International Transfers",
    varient: "success",
    description:
      "Send and receive money globally with competitive exchange rates.",
  },
  {
    id: 13,
    style: "top-[55%] right-[15%]",
    content: "Credit Score Monitoring",
    varient: "success",
    description:
      "Monitor and improve your credit score with real-time updates and tips.",
  },
  {
    id: 14,
    style: "top-[90%] left-[50%]",
    content: "Educational Resources",
    varient: "default",
    description:
      "Access a wealth of financial education resources and webinars.",
  },
  {
    id: 15,
    style: "top-[80%] right-[5%]",
    content: "Community Forum",
    varient: "warning",
    description:
      "Engage with our user community, share insights, and learn from others.",
  },
  {
    id: 16,
    style: "top-[25%] left-[50%]",
    content: "Instant Loans",
    varient: "error",
    description:
      "Get quick access to loans with competitive interest rates and flexible terms.",
  },
  {
    id: 17,
    style: "top-[67%] right-[5%]",
    content: "Retirement Planning",
    varient: "error",
    description:
      "Plan for your retirement with investment options tailored to your goals.",
  },
  {
    id: 18,
    style: "top-[75%] left-[45%]",
    content: "Family Accounts",
    varient: "success",
    description:
      "Manage family finances with separate accounts and shared budgeting.",
  },
  {
    id: 19,
    style: "top-[5%] right-[45%]",
    content: "Real-Time Analytics",
    varient: "warning",
    description:
      "Access real-time analytics and reports to make informed financial decisions.",
  },
  {
    id: 20,
    style: "top-[20%] left-[10%]",
    content: "Contactless Payments",
    varient: "default",
    description:
      "Make contactless payments with your mobile device or payment card.",
  },
  {
    id: 21,
    style: "top-[47%] right-[10%]",
    content: "Crypto Investments",
    varient: "success",
    description:
      "Invest in cryptocurrencies and track your crypto portfolio in real-time.",
  },
  {
    id: 22,
    style: "top-[70%] left-[30%]",
    content: "Auto-Savings",
    varient: "success",
    description:
      "Automatically save a portion of your income to meet your financial goals.",
  },
  {
    id: 23,
    style: "top-[90%] right-[20%]",
    content: "Credit Card Management",
    varient: "default",
    description:
      "Efficiently manage your credit cards, payments, and rewards in one place.",
  },

  {
    id: 24,
    style: "top-[5%] left-[15%]",
    content: "Investment News",
    varient: "default",
    description:
      "Stay updated with the latest investment news and market trends.",
  },
  {
    id: 25,
    style: "top-[35%] right-[3%]",
    content: "Credit Card Rewards",
    varient: "success",
    description:
      "Maximize your credit card rewards and cashback with our guidance.",
  },
  {
    id: 26,
    style: "top-[54.5%] left-[5%]",
    content: "Cryptocurrency Insights",
    varient: "success",
    description:
      "Get insights into the cryptocurrency market and make informed decisions.",
  },
  {
    id: 27,
    style: "bottom-[10%] right-[50%]",
    content: "Loan Comparison",
    varient: "error",
    description:
      "Compare loan options and find the best rates for your financial needs.",
  },
  {
    id: 28,
    style: "top-[13%] right-[35%]",
    content: "Secure Transactions",
    varient: "default",
    description: "Ensure secure and encrypted transactions for peace of mind.",
  },
  {
    id: 29,
    style: "top-[48%] left-0",
    content: "Retirement Calculator",
    varient: "warning",
    description:
      "Plan your retirement with our calculator and achieve financial security.",
  },
  {
    id: 30,
    style: "top-0 right-[25%]",
    content: "Budget Recommendations",
    varient: "warning",
    description:
      "Receive personalized budget recommendations to save more effectively.",
  },
  {
    id: 31,
    style: "top-[80%] right-[70%]",
    content: "Investment Portfolio",
    varient: "success",
    description:
      "Manage and diversify your investment portfolio for long-term growth.",
  },
  {
    id: 32,
    style: "top-[8%] left-[80%]",
    content: "Financial Literacy Courses",
    varient: "default",
    description:
      "Enroll in financial literacy courses to enhance your money management skills.",
  },
  {
    id: 33,
    style: "top-[28%] left-[18%]",
    content: "Transaction History",
    varient: "default",
    description:
      "Access detailed transaction history and download statements for reference.",
  },
];

const Features = () => {
  const screen = useScreenSize();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

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

  const itemVarient = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.section
      id="features"
      ref={ref}
      className="w-full px-5 h-screen mt-5 md:h-fit sm:h-fit"
    >
      <motion.header className="flex items-center justify-center flex-col gap-2">
        <Chip text="Features" varient="default" />
        <motion.h2 className="text-3xl sm:text-2xl wordGradient">
          Tons of feautures await you...
        </motion.h2>
      </motion.header>
      <motion.div
        animate={
          inView
            ? { opacity: 1, x: 0, transition: { delay: 1 } }
            : { opacity: 0, x: -30 }
        }
        className="h-full md:mt-5 sm:mt-5 w-full relative flex items-center md:gap-3 sm:gap-3 md:flex-col sm:flex-col justify-center"
      >
        <DebitCard
          type="color"
          name="Soolaiman"
          accountNumber={8088362315}
          balance={1500}
        />
        <motion.div
          animate={inView ? "visible" : "hidden"}
          variants={container}
          className="md:grid md:w-full sm:w-full md:grid-cols-1 sm:grid-cols-1 md:gap-2"
        >
          {featureContent.map((content) => (
            <motion.div
              variants={itemVarient}
              className={`flex md:w-full sm:w-full items-center justify-center md:relative lg:absolute 2xl:absolute ${
                (screen.x as number) >= 700 && content.style
              }`}
              key={content.id}
            >
              <Chip
                className="md:w-full sm:w-full sm:h-[2.5rem] md:h-[2rem]"
                varient={content.varient}
                text={content.content}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default Features;
