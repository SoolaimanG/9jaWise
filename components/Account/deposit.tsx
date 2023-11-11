import React, { useState } from "react";
import Button from "../button";
import Input from "../input";
import { BsFillClipboard2CheckFill } from "react-icons/bs";
import useClipboard from "@/Hooks/useClipboard";
import { useToast } from "../ui/use-toast";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { useStore } from "@/provider";

export type depositProps = {
  accountNumber: string;
  accountName: string;
  bankName: string;
  phoneNumber?: string;
  email?: string;
};

const Deposit = ({
  accountName,
  accountNumber,
  bankName,
  phoneNumber,
  email,
}: depositProps) => {
  const { user } = useStore();

  const { copyToClipboard } = useClipboard();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<string | number>(0);

  const handleFlutterPayment = useFlutterwave({
    public_key: process.env.FLW_SECRET_KEY!,
    tx_ref: String(Date.now()),
    amount: amount as number,
    customer: {
      phone_number: phoneNumber || "07068214943",
      name: accountName,
      email: email || "soolaimangee@gamil.com",
    },
    meta: {
      user_id: user?._id.toString(),
    },
    customizations: {
      title: "Fund Account",
      description: `I want to fund my account with ${amount}`,
      logo: "",
    },
    payment_options: "card,mobilemoney,ussd",
  });

  return (
    <div className="w-full p-2 rounded-md flex flex-col gap-2 border-solid border-[1.5px] border-gray-300">
      <p className="text-xl font-semibold text-purple-600">Deposit</p>
      {/* Deposit Tabs */}

      <Input
        value={amount as number}
        setValue={setAmount}
        error={false}
        disabled={false}
        placeholder="Amount you want to deposit"
        type="number"
      />
      <Button
        className="h-[2.5rem]"
        borderRadius={true}
        name="Use Flutterwave"
        states={loading ? "loading" : undefined}
        disabled={amount && !loading ? false : true}
        varient="danger"
        onClick={() => {
          setLoading(true);
          handleFlutterPayment({
            callback: (response) => {
              setLoading(false);
              console.log(response);
              closePaymentModal();
            },
            onClose: () => {},
          });
        }}
      />
      <p className="text-center text-lg text-gray-300">Or</p>
      <div className="w-full flex flex-col gap-1">
        <div className={"flex flex-col gap-1"}>
          <p>Account Name</p>
          <div className="flex items-center gap-2">
            <Input
              className="capitalize"
              value={accountName}
              setValue={() => {}}
              error={false}
              disabled={true}
              type="text"
            />
            <Button
              name=""
              icon={<BsFillClipboard2CheckFill />}
              borderRadius={true}
              disabled={false}
              varient={"outlined"}
              onClick={() => {
                copyToClipboard(accountName);
                toast({
                  title: "Account Name Copied",
                });
              }}
              className="h-[2.5rem] w-1/6"
            />
          </div>
        </div>
        <div className={"flex flex-col gap-1"}>
          <p>Account Number</p>
          <div className="flex items-center gap-2">
            <Input
              value={accountNumber}
              setValue={() => {}}
              error={false}
              disabled={true}
              type="text"
            />
            <Button
              name=""
              icon={<BsFillClipboard2CheckFill />}
              borderRadius={true}
              disabled={false}
              varient="outlined"
              onClick={() => {
                copyToClipboard(accountNumber);
                toast({ title: "Account Number Copied" });
              }}
              className="h-[2.5rem] w-1/6"
            />
          </div>
        </div>
        <div className={"flex flex-col gap-1"}>
          <p>Bank Name</p>
          <div className="flex items-center gap-2">
            <Input
              value={bankName ? "9JA WISE BANK" : ""}
              setValue={() => {}}
              error={false}
              disabled={true}
              type="text"
            />
            <Button
              name=""
              icon={<BsFillClipboard2CheckFill />}
              borderRadius={true}
              disabled={false}
              varient="outlined"
              onClick={() => {
                copyToClipboard(bankName);
                toast({ title: "Bank Name Copied" });
              }}
              className="h-[2.5rem] w-1/6"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Deposit;
