import React, { useEffect, useState } from "react";
import Input from "../input";
import Button from "../button";
import SelectBank from "./selectBank";
import { useStore } from "@/provider";
import { toast } from "../ui/use-toast";
import { DialogAlert } from "../dialogAlert";
import { Switch } from "../ui/switch";
import Beneficiaries from "./beneficiaries";
import { beneficiariesProps } from "@/Models/user";
import Ask_authentication from "./ask_authentication";
import Swiper from "../swiper";
import { useNairaFormatter } from "@/Hooks/useNairaFormatter";
import { BsCheck2 } from "react-icons/bs";
import { send_money_props } from "@/app/api/send-money/route";
import { useCheck } from "@/Hooks/useCheck";

const QuickTrf = () => {
  const { user, try_refresh, is_darkmode } = useStore(); //User Properties and Try Refresh to keep the user data updated

  //------------------------>States Trf Payload<----------------------------
  const [amount, setAmount] = useState<string | number>("");
  const [accountNumber, setAccountNumber] = useState<string | number>("");
  const [accountName, setAccountName] = useState<string | number>("");
  const [bankName, setBankName] = useState<string | number>("");
  const [bank_code, setBank_code] = useState("");
  const [save_beneficiary, setSave_beneficiary] = useState(false);
  const [password_or_otp, setPassword_or_otp] = useState<string | number>("");

  //-------->States For Track The Request State (loading|success|fail)<---------
  const [loading, setLoading] = useState(false);
  const [show_modal, setShow_modal] = useState(false);
  const [states, setStates] = useState({
    verifyingUser: false,
    verifyError: false,
    TrfSuccessfull: false,
    TrfError: false,
  });

  const check_password = useCheck(password_or_otp as string, "password");

  //Verify User Account Name using the provided bank and account number
  useEffect(() => {
    setStates({ ...states, verifyingUser: true });

    const getAccountName = async () => {
      setStates({ ...states, verifyingUser: true });

      const res = await fetch(
        `/api/flutterwave/verify-bank-name?account_number=${accountNumber
          .toString()
          .trim()}&account_bank=${bank_code}`
      );

      if (!res.ok) {
        setStates({ ...states, verifyError: true });
        setStates({ ...states, verifyingUser: false });
        return;
      }

      const data = await res.json();
      setStates({ ...states, verifyError: false });
      setStates({ ...states, verifyingUser: false });
      setAccountName(data.data.account_name);
    };

    if ((accountNumber as string).length >= 10 && bankName) {
      getAccountName();
    }
  }, [accountNumber, bankName]);

  //This is a function that returns True | False to disable and enable the send button
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

  //Function that triggers the request to be sent to the server for sending money to another account
  const send_money = async () => {
    setLoading(true);

    //Payloads need to send funds to other accounts
    const payload: send_money_props = {
      amount: Number(amount),
      password_or_otp: password_or_otp,
      accountName: accountName as string,
      account_number: String(accountNumber),
    };

    const res = await fetch("/api/send-money", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    //If the response is BAD return an error notification
    if (!res.ok) {
      setLoading(false);
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText,
        variant: "destructive",
      });
      return;
    }

    setPassword_or_otp("");
    setAmount(0);
    setAccountName("");
    setBank_code("");
    setBank_code("");
    setLoading(false);
    setShow_modal(true);
    try_refresh(); //perform hard refresh
  };

  //After Transaction You can save the account information as beneficiary to be easy to access in your application (When you want to perform another transaction with the account)
  const add_beneficiary = async () => {
    if (save_beneficiary) return;

    setLoading(true);

    const payload = {
      accountName: accountName,
      accountNumber: accountNumber,
      account_bank: bank_code,
      bankName: bankName,
    };

    const res = await fetch("/api/settings/beneficiary", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setLoading(false);
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText,
        variant: "destructive",
      });
      return;
    }

    setLoading(false);
    toast({
      title: "SUCCESS",
      description: res.statusText,
    });
    try_refresh();
  };

  //Show this success message when the user perform a successful transaction else and error toast will be shown
  const successmodal = (
    <DialogAlert
      open={show_modal}
      button={<></>}
      title="Transaction Success"
      content={
        <div className="w-full h-full flex items-center justify-start flex-col gap-3">
          <span className="text-3xl sm:text-xl p-3 border-solid border-[1.5px] border-green-600 rounded-full text-green-400">
            <BsCheck2 color={is_darkmode ? "white" : "black"} />
          </span>
          <p className="text-lg w-full text-center sm:text-[0.75rem]">
            Yay! You sent{" "}
            <strong className="wordGradient">
              {useNairaFormatter(Number(amount))}
            </strong>{" "}
            to {accountNumber}
          </p>
          <div className="w-full flex items-center justify-between">
            <p className="capitalize text-lg">Save as beneficiary?</p>
            <Switch
              disabled={loading}
              checked={save_beneficiary}
              onCheckedChange={() => {
                setSave_beneficiary((prev) => !prev);
                add_beneficiary();
              }}
            />
          </div>
          <Button
            className="w-full h-[2.5rem]"
            borderRadius
            varient="filled"
            name="Close"
            disabled={false}
            onClick={() => setShow_modal(false)}
          />
        </div>
      }
    />
  );

  //TODO:When the user turn on the ask auth in each transaction this will be shown and will ask for password or OTP and then process them in the server
  const show_send_modal = (
    <DialogAlert
      title="Send Money"
      description="Input your password and send money"
      button={
        <Button
          className="h-[2.5rem] rounded-md"
          name="Send money"
          disabled={
            amount && accountName && accountNumber && bankName ? false : true
          }
          varient="danger"
          onClick={() => {}}
        />
      }
      content={
        <div className="w-full flex flex-col gap-2">
          <Ask_authentication
            value={password_or_otp}
            setValue={setPassword_or_otp}
          />
          <Button
            className="w-full h-[2.5rem]"
            borderRadius
            name="Send Money"
            states={loading ? "loading" : undefined}
            disabled={
              user?.loginType === "password" && check_password && !loading
                ? false
                : user?.loginType === "otp" &&
                  password_or_otp.toString().length &&
                  !loading
                ? false
                : true
            }
            varient="danger"
            onClick={() => send_money()}
          />
        </div>
      }
    />
  );

  return (
    <div className="w-full p-2 rounded-md flex flex-col gap-2 border-solid border-[1.5px] border-gray-300">
      {/** Successmodal */}
      {successmodal}
      <h2 className="text-xl font-semibold text-purple-600">Quick Transfer</h2>
      <Beneficiaries
        can_delete={true}
        setAccountNumber={setAccountNumber}
        setBankName={setBankName}
        accountNumber={accountNumber as string}
        bankName={bankName as string}
        beneficiaries={user?.beneficiaries as beneficiariesProps[]}
      />
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
        className="capitalize"
      />
      {/* From what was discuss above we check if the user toggles the ask auth then depending on what is toggle we show which to show */}
      {user?.settings?.send_otp_for_each_transaction ? (
        show_send_modal
      ) : (
        <Button
          className="h-[2.5rem] rounded-md"
          name="Send money"
          states={loading ? "loading" : undefined}
          disabled={shouldButtonDisable() && !loading ? false : true}
          varient="danger"
          onClick={send_money}
        />
      )}
    </div>
  );
};

export default QuickTrf;
