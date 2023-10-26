import React from "react";
import { motion } from "framer-motion";

const Instructions = () => {
  const instructions = [
    {
      id: 1,
      instruction: "Ask questions related to this application",
    },
    {
      id: 3,
      instruction: "Type CLEAR or RESET to clear screen",
    },
    {
      id: 2,
      instruction: "You can create account from here",
    },
    {
      id: 4,
      instruction: "Type MODES to show modes",
    },
  ];
  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      className="flex items-center justify-center w-full flex-col gap-2"
    >
      {instructions.map((item) => (
        <motion.div
          key={item.id}
          className="w-fit cursor-pointer p-2 text-[0.9rem] rounded-md bg-purple-300 text-white"
        >
          {item.instruction}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Instructions;
