"use client";

import Button from "../button";
import Input from "../input";
import { motion } from "framer-motion";
import { useState } from "react";
import SlideIn from "../Animations/slideIn";
import FadeIn from "../Animations/fadeIn";
import { useStore } from "@/provider";
import { toast } from "../ui/use-toast";
import { addStatusMessage } from "./data";

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
};

const RequestPayment = () => {
  const [amount, setAmount] = useState<string | number>("");
  const [id, setId] = useState<string | number>("");
  const [loading, setLoading] = useState(false);

  const { user, try_refresh } = useStore();

  const request_payments = async () => {
    setLoading(true);

    const payload = {
      id: id,
      amount: amount,
    };

    const res = await fetch("/api/request-payment", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setLoading(false);
      toast({
        title: `ERROR ${res.status}`,
        description: addStatusMessage(res.status as 400),
        variant: "destructive",
      });
      return;
    }

    setLoading(false);
    toast({
      title: `SUCCESS`,
      description: addStatusMessage(res.status as 200),
    });
    try_refresh();
  };

  return (
    <FadeIn className="w-full px-2 py-4 mt-2 rounded-md dark:bg-slate-900 bg-gray-100">
      <p className="text-purple-700 text-lg sm:text-[1rem] dark:text-gray-300">
        Request Payment
      </p>
      <span className="text-gray-500 dark:text-gray-300">
        You can only request payment from 9jaWise users
      </span>
      <div className="w-full flex flex-col gap-3 mt-3">
        <Input
          value={id}
          setValue={setId}
          type="text"
          placeholder={`@username/email/account-number (@${user?.username})`}
          className="placeholder:capitalize"
        />
        {(user?.beneficiaries.length as number) >= 1 && (
          <div className="w-full">
            <SlideIn>Select from beneficiaries</SlideIn>
            <motion.div
              animate="visible"
              initial="hidden"
              variants={containerVariant}
              className="w-full mt-3 overflow-auto flex gap-5"
            >
              {user?.beneficiaries.slice(0, 7).map((b) => (
                <motion.div
                  onClick={() => setId(b.accountNumber)}
                  variants={eachItemVariant}
                  className="cursor-pointer flex item-center justify-center gap-1 flex-col"
                  key={b.accountName}
                >
                  <p
                    className={`text-2xl w-[4rem] sm:w-[3rem] flex items-center justify-center h-[4rem]  ${
                      id === b.accountNumber
                        ? "text-white bg-purple-600"
                        : "bg-gray-400 text-purple-700"
                    } sm:h-[3rem] rounded-full   font-semibold`}
                  >
                    {b.accountName[0]}
                  </p>
                  <span className="text-center">
                    {b.accountName.split(" ")[0]}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
        <Input
          value={amount}
          setValue={setAmount}
          type="text"
          placeholder="Enter an amount"
        />
        <Button
          className="w-full h-[2.5rem]"
          name="Request"
          varient="filled"
          states={loading ? "loading" : undefined}
          disabled={amount && id && !loading ? false : true}
          onClick={request_payments}
          borderRadius
        />
      </div>
    </FadeIn>
  );
};

export default RequestPayment;
