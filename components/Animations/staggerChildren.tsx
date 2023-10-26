import { motion } from "framer-motion";
import { MotionProps } from "./expand";

const StaggerChildren: React.FC<MotionProps & { className?: string }> = ({
  children,
  className,
}) => {
  const container = {
    hidden: {
      opacity: 0,
      x: -200,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        delay: 0.75,
        stiffness: 0.3,
        staggerChildren: 0.3,
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {children}
    </motion.div>
  );
};

export default StaggerChildren;
