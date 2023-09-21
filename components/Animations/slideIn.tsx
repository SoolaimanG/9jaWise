import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { MotionProps } from "./expand";

const SlideIn: React.FC<MotionProps> = ({ children }) => {
  return (
    <AnimatePresence>
      <motion.div
        animate={{ x: 0, opacity: 1 }}
        initial={{ x: 200, opacity: 0 }}
        exit={{ x: -200, opacity: 0 }} // Adjusted exit property to slide out to the left
        transition={{ duration: 0.5, damping: 0.8 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default SlideIn;
