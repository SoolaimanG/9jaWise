import React from "react";
import { MotionProps } from "./expand";
import { AnimatePresence, motion } from "framer-motion";

const FadeIn: React.FC<MotionProps> = ({ children }) => {
  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 0 }}
        initial={{ opacity: 1 }}
        transition={{ duration: 0.75, damping: 3 }}
      >
        {children}
      </motion.div>
      ;
    </AnimatePresence>
  );
};

export default FadeIn;
