import React, { useState } from "react";
import Button from "../button";
import Input from "../input";
import { BsFillClipboard2CheckFill } from "react-icons/bs";
import useClipboard from "@/Hooks/useClipboard";
import { useToast } from "../ui/use-toast";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { usePathname } from "next/navigation";
import { useGetId } from "@/Hooks/useGetId";

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
  const { copyToClipboard } = useClipboard();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const _id = useGetId(2);
  const [amount, setAmount] = useState<string | number>(0);

  const handleFlutterPayment = useFlutterwave({
    public_key: "FLWPUBK_TEST-76b4b0f7cc0b2dec958115a5ffe55038-X",
    tx_ref: String(Date.now()),
    amount: amount as number,
    customer: {
      phone_number: phoneNumber || "07068214943",
      name: accountName,
      email: email || "soolaimangee@gamil.com",
    },
    meta: {
      _id,
    },
    customizations: {
      title: "Fund Account",
      description: `I want to fund my account with ${1000}`,
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
        disabled={!amount}
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
              value={bankName}
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
