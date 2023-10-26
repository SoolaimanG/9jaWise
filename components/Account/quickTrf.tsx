import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Input from "../input";
import Button from "../button";
import { beneficiariesProps } from "@/Models/user";
import SelectBank from "./selectBank";
import { usePathname } from "next/navigation";
import { useStore } from "@/provider";
import EmptyState from "./emptyState";

export type quickTrfProps = {
  beneficiaries: beneficiariesProps;
};

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

const QuickTrf = ({ beneficiaries }: quickTrfProps) => {
  const [amount, setAmount] = useState<string | number>("");
  const [accountNumber, setAccountNumber] = useState<string | number>("");
  const [accountName, setAccountName] = useState<string | number>("");
  const [bankName, setBankName] = useState<string | number>("");
  const [bank_code, setBank_code] = useState("");
  const id = usePathname().split("/")[2];
  const { user } = useStore();
  const abortRef = useRef<AbortController | null>(null);

  const [states, setStates] = useState({
    verifyingUser: false,
    verifyError: false,
    TrfSuccessfull: false,
    TrfError: false,
  });

  useEffect(() => {
    //setStates({ ...states, verifyingUser: true });
    abortRef.current?.abort();

    abortRef.current = new AbortController();
    const getAccountName = async () => {
      setStates({ ...states, verifyingUser: true });

      const res = await fetch(
        `http://localhost:8000/api/flutterwave/verify-bank-name?account_number=${accountNumber}&account_bank=${bank_code}`,
        {
          headers: {
            user_id: id,
          },
          signal: abortRef.current?.signal,
        }
      );

      if (!res.ok) {
        setStates({ ...states, verifyError: true });
        setStates({ ...states, verifyingUser: false });
        setAccountName("");
        return;
      }

      const data = await res.json();
      console.log(data);
      setStates({ ...states, verifyError: false });
      setStates({ ...states, verifyingUser: false });
      setAccountName(data.data.account_name);
    };

    if ((accountNumber as string).length >= 10 && bankName) {
      getAccountName();
    }
  }, [accountNumber, bankName]);

  const shouldButtonDisable = () => {
    return (
      !isNaN(Number(amount as string)) &&
      !isNaN(Number(accountNumber as string)) &&
      accountNumber.toString().length >= 10 &&
      bankName &&
      !states.verifyError &&
      !states.verifyingUser
    );
  };

  return (
    <div className="w-full p-2 rounded-md flex flex-col gap-2 border-solid border-[1.5px] border-gray-300">
      <h2 className="text-xl font-semibold text-purple-600">Quick Transfer</h2>
      {(user?.beneficiaries.length as number) <= 0 ? (
        <EmptyState message="No saved beneficiary" />
      ) : (
        <motion.div
          animate="visible"
          initial="hidden"
          variants={containerVariant}
          className="w-full overflow-auto flex gap-5"
        >
          {beneficiaries.map((data) => (
            <motion.div
              onClick={() => {
                setAccountNumber(data.accountNumber);
                setBankName(data.bankName);
              }}
              variants={eachItemVariant}
              className="cursor-pointer flex item-center justify-center gap-1 flex-col"
              key={data.accountName}
            >
              <p
                className={`text-2xl w-[4rem] sm:w-[3rem] flex items-center justify-center h-[4rem] sm:h-[3rem] rounded-full ${
                  accountNumber === data.accountNumber &&
                  bankName === data.bankName
                    ? "text-white bg-purple-600"
                    : "bg-gray-400 text-purple-700"
                }  font-semibold`}
              >
                {data.accountName[0]}
              </p>
              <span className="text-center">
                {data.accountName.split(" ")[0]}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
      <p className="text-xl font-semibold text-purple-600">Enter Details</p>
      <Input
        type="text"
        value={accountNumber as string}
        setValue={setAccountNumber}
        error={false}
        disabled={false}
        placeholder="Enter Account Number"
      />
      <Input
        type="number"
        value={amount}
        setValue={setAmount}
        error={false}
        disabled={false}
        placeholder="Enter Amount"
      />
      <SelectBank
        setBank_code={setBank_code}
        selected={bankName as string}
        setSelected={setBankName}
      />
      <Input
        type="text"
        value={accountName as string}
        setValue={() => {}}
        error={states.verifyError}
        disabled={true}
        placeholder={
          states.verifyingUser ? "Verifying Account" : "Receiver's Account Name"
        }
      />
      <Button
        className="h-[2.5rem] rounded-md"
        name="Send money"
        disabled={shouldButtonDisable() ? false : true}
        varient="danger"
        onClick={() => {}}
      />
    </div>
  );
};

export default QuickTrf;
