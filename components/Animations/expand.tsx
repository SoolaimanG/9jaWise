import { AnimatePresence, motion } from "framer-motion";
import React from "react";

export interface MotionProps {
  children: React.ReactNode;
}

const Expand: React.FC<MotionProps & { className?: string }> = ({
  children,
  className,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        className={className}
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.5 }}
        transition={{ damping: 3, type: "tween" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default Expand;
