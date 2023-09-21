import { useStore } from "@/provider";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

const SignUp = () => {
  const { is_darkmode } = useStore();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });
  return (
    <motion.section
      ref={ref}
      className="w-full flex md:px-5 sm:px-5 items-center justify-center h-[50vh] sm:h-fit md:h-fit"
    >
      <motion.div
        animate={
          inView
            ? {
                y: 0,
                transition: { delay: 0.75, stiffness: 0.4 },
                translateY: 0,
              }
            : { y: 50, translateY: 200 }
        }
        className={`flex md:flex-col sm:flex-col items-center px-3 py-4 justify-center gap-2 border border-white text-white signUpGradient w-[80%] md:w-full sm:w-full m-auto h-[80%] rounded-md`}
      >
        <div className="w-[70%] md:w-full sm:w-full flex flex-col gap-2">
          <motion.h2
            animate={
              inView
                ? { opacity: 1, transition: { delay: 0.75, stiffness: 0.4 } }
                : { y: 50, opacity: 0 }
            }
            className="text-5xl sm:text-3xl"
          >
            Sign Up for free today!
          </motion.h2>
          <motion.p
            animate={
              inView
                ? { opacity: 1, transition: { delay: 0.75, stiffness: 0.4 } }
                : { y: 50, opacity: 0 }
            }
            className="text-xl sm:text-lg"
          >
            Everything you need to accept payment and grow your business around
            the world.
          </motion.p>
        </div>
        <Link
          href={"/"}
          className="flex items-center w-[20%] md:w-full sm:w-full py-2  justify-center gap-1 cursor-pointer text-xl rounded-xl gradient-one"
        >
          Get Started
          <BsArrowRight />
        </Link>
      </motion.div>
    </motion.section>
  );
};

export default SignUp;
