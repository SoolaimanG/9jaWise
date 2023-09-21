"use client";

import Link from "next/link";
import DarkMode from "../darkMode";
import Logo from "../logo";
import { AiOutlineClose } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/provider";

export type pathProps = "#how-it-works" | "#home" | "#features" | "#why-us";

export type navListProps = {
  id: number;
  name: string;
  path: pathProps;
};

export const navList: navListProps[] = [
  {
    id: 1,
    name: "Home",
    path: "#home",
  },
  {
    id: 2,
    name: "Why us",
    path: "#why-us",
  },
  {
    id: 3,
    name: "Features",
    path: "#features",
  },
  {
    id: 4,
    name: "How it works",
    path: "#how-it-works",
  },
];

const LandingNavBar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [awayFromTop, setAwayFromTop] = useState(false);
  const { is_darkmode } = useStore();

  const [currentPath, setCurrentPath] = useState<pathProps>("#home");

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setAwayFromTop(true);
      } else {
        setAwayFromTop(false);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="w-full flex justify-center">
      <nav
        className={`${
          awayFromTop ? "w-[95%] mt-3" : "w-full"
        } z-20 fixed px-3 transition-all flex items-center justify-between ${
          awayFromTop
            ? "navGlassmorphism py-3 rounded-md border border-slate-700 dark:border-gray-200"
            : "bg-transparent py-2"
        }`}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={item}
          className="w-fit"
        >
          <Logo size="medium" color="purple" />
        </motion.div>
        <div className="w-full flex items-center md:hidden sm:hidden gap-5 justify-end">
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                staggerChildren: 0.5,
                delayChildren: 0.3,
              },
            }}
            className="flex items-center gap-3"
          >
            {navList.map((n) => (
              <motion.li
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  setCurrentPath(n.path);
                }}
                className="relative"
                key={n.id}
              >
                <a
                  className={`text-xl hover:text-purple-600 ${
                    n.path === currentPath && "navbarHover text-purple-600"
                  }`}
                  href={n.path}
                >
                  {n.name}
                </a>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={container}
            className="flex items-center gap-5"
          >
            <DarkMode hide_name={true} color="p" position="h" />
            <motion.div variants={item}>
              <Link
                className={`text-xl px-5 py-1 rounded-md border border-purple-600 text-purple-600`}
                href={"/"}
              >
                Sign In
              </Link>
            </motion.div>
            <motion.div variants={item}>
              <Link
                className={`text-xl px-5 py-1 rounded-md bg-purple-600 text-white`}
                href={"/"}
              >
                Sign Up
              </Link>
            </motion.div>
          </motion.div>
        </div>
        {/* [MOBILE NAVBAR STARTS HERE] */}
        {isNavOpen && (
          <div
            onClick={() => setIsNavOpen(false)}
            className="w-screen hidden sm:block md:block h-screen absolute left-0 top-0 glassmorph z-10"
          />
        )}
        <div
          onClick={() => setIsNavOpen((prev) => !prev)}
          className="hidden z-30 sm:block md:block cursor-pointer"
        >
          {isNavOpen ? (
            <AiOutlineClose size={25} />
          ) : (
            <GiHamburgerMenu size={25} />
          )}
          <AnimatePresence>
            {isNavOpen && (
              <motion.div
                key={JSON.stringify(isNavOpen)}
                initial={{ opacity: 0, translateX: -100 }}
                animate={{
                  opacity: 1,
                  translateX: 0,
                  transition: { stiffness: 0.5 },
                }}
                exit={{ opacity: 0, translateX: -100 }}
                className="fixed w-[80%] flex flex-col gap-5 h-screen bg-gray-100 dark:bg-slate-700 left-0 top-0 pt-2 pb-5"
              >
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: { stiffness: 0.5, delay: 1 },
                  }}
                  className="w-full px-5 flex items-center justify-between"
                >
                  <Logo
                    color={is_darkmode ? "white" : "purple"}
                    size="medium"
                  />
                  <DarkMode hide_name={true} color="p" position="h" />
                </motion.div>
                <motion.ul
                  initial="hidden"
                  animate="visible"
                  variants={container}
                  className="w-full h-full pl-5 flex gap-5 flex-col justify-evenly"
                >
                  {navList.map((n) => (
                    <motion.li
                      variants={item}
                      onClick={() => {
                        setCurrentPath(n.path);
                      }}
                      key={n.id}
                    >
                      <a
                        className={`text-2xl transition delay-75 hover:text-purple-600
                     } ${
                       n.path === currentPath && "text-purple-600 navbarHover"
                     }`}
                        href={n.path}
                      >
                        {n.name}
                      </a>
                    </motion.li>
                  ))}
                </motion.ul>
                <motion.div className="flex items-center w-full gap-3 px-3 justify-center">
                  <Link
                    className={`text-xl text-center w-full py-2 rounded-md border border-purple-600 text-purple-600`}
                    href={"/"}
                  >
                    Sign In
                  </Link>
                  <Link
                    className={`text-xl text-center w-full py-2 rounded-md bg-purple-600 text-white`}
                    href={"/"}
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </div>
  );
};

export default LandingNavBar;
