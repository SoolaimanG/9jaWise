import { AnimatePresence, motion } from "framer-motion";
import React from "react";

export interface MotionProps {
  children: React.ReactNode;
}

const Expand: React.FC<MotionProps> = ({ children }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={{ duration: 0.5, damping: 5 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default Expand;
