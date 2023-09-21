import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { MotionProps } from "./expand";

const SlideFromBelow: React.FC<MotionProps> = ({ children }) => {
  return (
    <AnimatePresence>
      <motion.div
        animate={{ y: 0, opacity: 1 }}
        initial={{ y: 200, opacity: 0 }}
        exit={{ y: 200, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }} // Added ease property for smoother animation
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default SlideFromBelow;
