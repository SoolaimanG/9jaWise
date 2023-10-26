"use client";

import { AiOutlinePlus, AiOutlineWifi } from "react-icons/ai";
import { IoMdCall } from "react-icons/io";
import { MdCable, MdOutlineElectricBolt } from "react-icons/md";
import { TbMobiledata } from "react-icons/tb";
import { motion } from "framer-motion";
import SheetComp from "../sheet";
import { useStore } from "@/provider";
import { SheetClose } from "../ui/sheet";
import { BsArrowLeft } from "react-icons/bs";
import Airtime from "./airtime";
import Data from "./data";
import Internet from "./internet";
import Power from "./power";
import { IoBookmarksOutline } from "react-icons/io5";
import Saving from "./savings";
import Invite from "./invite";

const billCategory = [
  {
    icon: <IoMdCall />,
    category: "airtime",
  },
  {
    icon: <TbMobiledata />,
    category: "data bundle",
  },
  {
    icon: <MdOutlineElectricBolt />,
    category: "power",
  },
  {
    icon: <AiOutlineWifi />,
    category: "internet",
  },
  {
    icon: <IoBookmarksOutline />,
    category: "saving",
  },
  {
    icon: <AiOutlinePlus />,
    category: "invite",
  },
];

const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3, duration: 0.7 },
  },
};
const eachItemVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const More = () => {
  const { is_darkmode, user } = useStore();

  return (
    <div className="w-full p-2 rounded-md flex flex-col gap-2 border-solid border-[1.5px] border-gray-300">
      <p className="text-xl font-semibold text-purple-600">Bill Payment</p>
      <motion.div
        animate="visible"
        initial="hidden"
        variants={containerVariant}
        className="w-full overflow-auto mt-1 grid grid-cols-3 grid-rows-2 gap-y-12 gap-x-5"
      >
        {billCategory.map((type) => (
          <motion.div
            className="w-full flex flex-col cursor-pointer gap-1 items-center"
            variants={eachItemVariant}
            key={type.category}
          >
            <SheetComp
              button={
                <button className="capitalize flex flex-col cursor-pointer gap-1 items-center">
                  <span className="text-xl p-3 bg-purple-200 rounded-md text-purple-700">
                    {type.icon}
                  </span>
                  {type.category}
                </button>
              }
              header={
                <div
                  className={`flex p-2 ${
                    is_darkmode ? "glassmorph_darkmode" : "navGlassmorphism"
                  } z-30 gap-2 text-2xl text-purple-700 w-full`}
                >
                  <SheetClose className="text-gray-500  dark:text-gray-300">
                    <BsArrowLeft size={20} />
                  </SheetClose>
                  <p className="w-full flex font-semibold items-center justify-center">
                    {type.category.toUpperCase()}
                  </p>
                </div>
              }
            >
              <div className="w-full p-2">
                {type.category === "airtime" && <Airtime />}
                {type.category === "data bundle" && <Data />}
                {type.category === "internet" && <Internet />}
                {type.category === "saving" && <Saving />}
                {type.category === "invite" && <Invite />}
                {type.category === "power" && <Power />}
              </div>
            </SheetComp>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default More;
