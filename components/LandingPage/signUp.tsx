//------------->All Imports<-------------
import { useStore } from "@/provider";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SlideIn from "../Animations/slideIn";

const SignUp = () => {
  const { is_darkmode } = useStore(); //Darkmode from zustand

  const ref = useRef<HTMLElement | null>(null); //a useRef for access the element we want to track if it's in view or not
  //Use react-intersection-observer to know when an element enter view
  const inView = useInView(ref, { once: true }); //Use inView is a framer motion hook that detects when an element enter view or leave [This is set to once because we want to observe just once]
  return (
    <motion.section
      ref={ref} //Refrence to this div -->Keep an eye on this element to know whether it leaves or enter the view
      className="w-full flex md:px-5 sm:px-3 items-center justify-center h-[50vh] sm:h-fit md:h-fit"
    >
      <SlideIn
        className={`flex md:flex-col sm:flex-col items-center px-3 py-4 justify-center gap-2 border border-white text-white ${
          is_darkmode ? "gradient-one" : "gradient-two"
        } w-[80%] md:w-full sm:w-full m-auto h-[80%] rounded-md`}
      >
        <div className="w-[70%] md:w-full sm:w-full flex flex-col gap-2">
          <motion.h2
            animate={
              inView
                ? { opacity: 1, transition: { delay: 0.75, stiffness: 0.4 } }
                : { y: 300, opacity: 0 }
            }
            className="text-5xl sm:text-3xl"
          >
            Sign Up for free today!
          </motion.h2>
          <motion.p
            animate={
              inView
                ? { opacity: 1, transition: { delay: 0.75, stiffness: 0.4 } }
                : { y: 300, opacity: 0 }
            }
            className="text-xl md:text-base sm:text-lg"
          >
            Everything you need to accept payment and grow your business around
            the world.
          </motion.p>
        </div>
        <Link
          href={"/auth/signup"}
          className="flex items-center w-[20%] md:w-full sm:w-full py-2  justify-center gap-1 cursor-pointer text-xl rounded-md gradient-one"
        >
          Get Started
          <BsArrowRight />
        </Link>
      </SlideIn>
    </motion.section>
  );
};

export default SignUp;
