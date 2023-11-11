//----------->All Imports<-----------
import TextStreamer from "@/Functions/TSX/textStream";
import { motion } from "framer-motion";
import { SetStateAction } from "react";

export interface responseProps {
  reply: string;
  options?: string[];
  chatBotImage?: string;
}
type personalResProps = {
  query?: string;
  setQuery: React.Dispatch<SetStateAction<string | number>>;
};
//------->Framer Motion [For animating the button]<---------
const containerVariant = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.5,
      stiffness: 0.3,
      duration: 0.35,
    },
  },
};
const buttonVarient = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const Response = (props: responseProps & personalResProps) => {
  const { reply, options, setQuery, chatBotImage } = props;

  return (
    <div className="w-full relative flex gap-1">
      {chatBotImage && (
        <img
          className="w-[2.5rem] cursor-pointer h-[2.5rem] rounded-full"
          src={chatBotImage}
          alt="chat-bot"
        />
      )}
      <div className="w-full flex flex-col gap-2">
        <div className="w-fit p-2 cursor-pointer text-white bg-purple-500 rounded-b-xl rounded-tr-xl">
          <TextStreamer text={reply} speed={15} />
        </div>
        <motion.div
          animate="visible"
          initial="hidden"
          variants={containerVariant}
          className="w-full flex items-center gap-2"
        >
          {(options?.length as number) > 1 &&
            options?.map((_, i) => (
              <motion.button
                onClick={() => setQuery(_)}
                variants={buttonVarient}
                className="w-fit px-2 py-1 text-[0.9rem] bg-purple-900 rounded- text-white"
                key={i}
              >
                {_}
              </motion.button>
            ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Response;
