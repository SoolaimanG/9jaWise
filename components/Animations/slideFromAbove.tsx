import { AnimatePresence, motion } from "framer-motion";

const SlideFromAbove = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <AnimatePresence>
      <motion.div
        className={className}
        initial={{ y: -100, opacity: 0 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { type: "spring", delay: 0.5 },
        }}
        exit={{ y: -100, opacity: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default SlideFromAbove;
