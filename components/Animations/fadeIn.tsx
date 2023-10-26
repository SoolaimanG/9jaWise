import React from "react";
import { MotionProps } from "./expand";
import { AnimatePresence, motion } from "framer-motion";

const FadeIn: React.FC<MotionProps & { className?: string }> = ({
  children,
  className,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.75, damping: 3 }}
        className={className}
      >
        {children}
      </motion.div>
      ;
    </AnimatePresence>
  );
};

export default FadeIn;
