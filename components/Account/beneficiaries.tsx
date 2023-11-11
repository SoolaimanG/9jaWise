import React, { SetStateAction, useEffect, useState } from "react";
import EmptyState from "./emptyState";
import { AnimatePresence, motion } from "framer-motion";
import { beneficiariesProps, userProps } from "@/Models/user";
import { X } from "lucide-react";
import { useStore } from "@/provider";
import { toast } from "../ui/use-toast";

//------------->Framer Motion<-------------
const containerVariant = {
  hidden: { opacity: 0, y: -100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.3, duration: 0.7 },
  },
};
const eachItemVariant = {
  hidden: { opacity: 0, y: -100 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -100 },
};

const Beneficiaries = ({
  beneficiaries,
  bankName,
  setBankName,
  setAccountNumber,
  accountNumber,
  can_delete,
}: {
  beneficiaries?: beneficiariesProps[];
  setAccountNumber: React.Dispatch<SetStateAction<string | number>>;
  setBankName: React.Dispatch<SetStateAction<string | number>>;
  accountNumber: string;
  bankName: string;
  can_delete?: boolean;
}) => {
  const { user, try_refresh, setUser } = useStore(); //Zustand Provideer for global state
  const [_, setPrev_user] = useState<userProps<beneficiariesProps> | null>(
    user
  );
  const [loading, setLoading] = useState(false); //Track the request sent by the user to remove beneficiary

  const remove_beneficiary_OP = async (account_number: string) => {
    //If the user is null return which will not be the case but typescript 🤦‍♂️ forces me to
    if (!user) return;

    setPrev_user(user);

    const { beneficiaries } = user; //Destructing user to get it's properties

    //remove the beneficiary user wants to filter and perform optimistic updates
    const filtered_beneficiaries = beneficiaries.filter((beneficiary) => {
      return (
        beneficiary.accountNumber.toLowerCase() !== account_number.toLowerCase()
      );
    });

    //Setting the user properties with the new filtered beneficiaries
    const user_data: userProps<beneficiariesProps> = {
      ...user,
      beneficiaries: filtered_beneficiaries,
    };

    setUser(user_data);
    setLoading(true);

    //Payload/ Data Needed to delete an account from beneficiaries
    const payload = {
      account_number: account_number,
    };

    const res = await fetch("/api/settings/beneficiary", {
      method: "DELETE",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setLoading(false);
      //@ts-ignore
      setPrev_user((prev: userProps<beneficiariesProps>) => {
        setUser(prev);
      });
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText,
      });
      return;
    }

    toast({
      title: "SUCCESS",
      description: res.statusText,
    });
    setLoading(false);
    try_refresh(); //Try hard refresh
  };

  return (
    <>
      {(beneficiaries?.length as number) <= 0 ? (
        <EmptyState message="No saved beneficiary" />
      ) : (
        <motion.div
          animate="visible"
          initial="hidden"
          variants={containerVariant}
          exit="exit"
          className="w-full overflow-auto flex gap-5"
        >
          {beneficiaries?.map((data) => (
            <motion.div
              onClick={() => {
                setAccountNumber(data.accountNumber);
                setBankName(data.bankName);
              }}
              variants={eachItemVariant}
              className="cursor-pointer relative flex item-center justify-center gap-1 flex-col"
              key={data.accountName}
            >
              {can_delete && (
                <button
                  disabled={loading}
                  onClick={() => remove_beneficiary_OP(data.accountNumber)}
                  className="absolute disabled:bg-red-300 mr-2 rounded-full text-white p-[2px] bg-red-400 top-0 right-0"
                >
                  <X size={15} />
                </button>
              )}
              <p
                className={`text-2xl w-[4rem] sm:w-[3rem] flex items-center justify-center h-[4rem] sm:h-[3rem] rounded-full ${
                  accountNumber === data.accountNumber &&
                  bankName === data.bankName
                    ? "text-white bg-purple-600"
                    : "bg-gray-400 text-purple-700"
                }  font-semibold`}
              >
                {data?.accountName[0]?.toUpperCase()}
              </p>
              <span className="text-center capitalize">
                {data.accountName.split(" ")[0].slice(0, 6)}
              </span>
            </motion.div>
          ))}
        </motion.div>
        //</AnimatePresence>
      )}
    </>
  );
};

export default Beneficiaries;
