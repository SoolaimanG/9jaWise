import React from "react";
import { motion } from "framer-motion";

const BotError = ({ error }: { error: string | null }) => {
  return (
    <>
      {error && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: -40 }}
          className="flex w-fit border text-red-500 border-red-700 items-center p-1 rounded-md glassmorph justify-center"
        >
          {error}
        </motion.div>
      )}
    </>
  );
};

export default BotError;
