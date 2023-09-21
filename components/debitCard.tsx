import { useStore } from "@/provider";
import { motion } from "framer-motion";

export type debitCardProps = {
  type: "color" | "glassmorphism";
  name: string;
  accountNumber: number;
  balance: number;
  transform?: boolean;
};

const DebitCard = (props: debitCardProps) => {
  const { type, name, accountNumber, balance, transform } = props;
  const { is_darkmode } = useStore();

  const styles = {
    color: `${is_darkmode ? "purpleGradient_dark" : "purpleGradient_light"}`,
    glassmorphism: ` ${
      is_darkmode ? "cardGlassmorphism_dark" : "cardGlassmorphism_light"
    }`,
  };

  return (
    <motion.div
      key={JSON.stringify(transform)} //Using JSON.stringify because transform is boolean
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
      className={`rounded-md w-[25rem] md:w-full sm:w-full ${styles[type]} transition-all delay-50 h-fit ease-linear cursor-pointer`}
    >
      {!transform && (
        <div
          className={`w-full flex items-center justify-between px-2 sm:px-1 py-2 sm:py-0 ${
            type === "glassmorphism" ? "text-purple-600" : "text-white"
          }`}
        >
          <div className="flex flex-col gap-1 sm:gap-0">
            <strong className="sm:text-[1.3rem] text-[1.6rem] dark:text-white">
              Name
            </strong>
            <span
              className={`sm:text-[1rem] dark:text-white ${
                type === "glassmorphism" && "text-blacks-1000 "
              }`}
            >
              {name}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:gap-0">
            <strong className="sm:text-[1.3rem] text-[1.6rem] dark:text-white">
              Number
            </strong>
            <span
              className={`sm:text-[1rem] dark:text-white ${
                type === "glassmorphism" && "text-blacks-1000"
              }`}
            >
              {accountNumber}
            </span>
          </div>
        </div>
      )}
      <div
        className={`w-full ${
          transform
            ? "h-full text-white"
            : `h-fit ${type !== "glassmorphism" && "glassmorph_darkmode"}`
        }  mt-6 sm:mt-3 z-10 rounded-b-md`}
      >
        <div className="w-full flex items-center justify-between p-2">
          <div className="flex flex-col gap-1 sm:gap-0">
            <span
              className={`sm:text-[0.9rem] text-[1rem] dark:text-white ${
                type === "glassmorphism" &&
                "text-blacks-1000 dark:text-gray-500"
              }`}
            >
              Balance
            </span>
            <strong
              className={`sm:text-[1rem] text-[1.7rem] dark:text-white ${
                type === "glassmorphism" &&
                "text-blacks-1000 dark:text-gray-500"
              }`}
            >
              {"N" + balance}
            </strong>
          </div>
          <svg
            width={30}
            height={30}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            id="mastercard"
          >
            <path
              fill="#FF5F00"
              d="M15.245 17.831h-6.49V6.168h6.49v11.663z"
            ></path>
            <path
              fill="#EB001B"
              d="M9.167 12A7.404 7.404 0 0 1 12 6.169 7.417 7.417 0 0 0 0 12a7.417 7.417 0 0 0 11.999 5.831A7.406 7.406 0 0 1 9.167 12z"
            ></path>
            <path
              fill="#F79E1B"
              d="M24 12a7.417 7.417 0 0 1-12 5.831c1.725-1.358 2.833-3.465 2.833-5.831S13.725 7.527 12 6.169A7.417 7.417 0 0 1 24 12z"
            ></path>
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default DebitCard;
