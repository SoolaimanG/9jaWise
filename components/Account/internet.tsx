import React, { useEffect, useState } from "react";
import Button from "../button";
import Input from "../input";
import { DialogAlert } from "../dialogAlert";
import { useFetchData } from "@/Hooks/useFetchData";
import Loaders from "../loaders";
import { DialogClose } from "@radix-ui/react-dialog";
import Ask_authentication from "./ask_authentication";
import { useStore } from "@/provider";
import { toast } from "../ui/use-toast";

type tvProps = {
  id: number;
  label_name: string;
  biller_name: string;
  biller_code: string;
  item_code: string;
  amount: number;
};

const Internet = () => {
  const { user } = useStore();

  const [loading, setLoading] = useState(false);
  const [billers, setBillers] = useState<tvProps[]>([]);
  const [billProps, setBillProps] = useState({
    biller_name: "",
    item_code: "",
    amount: 0,
  });
  const [otp_or_password, setOtp_or_password] = useState<string | number>("");
  const [card_number, setCard_number] = useState<string | number>("");

  const { is_loading, data, error } = useFetchData<tvProps[]>({
    url: `${process.env.NEXT_PUBLIC_URL}/api/flutterwave/get-bill-categories`,
    retry: true,
    interval: 3000,
  });

  useEffect(() => {
    const filter = data?.filter((d) => {
      return d.label_name === "SmartCard Number";
    });

    if (!filter) {
      return;
    }

    setBillers(filter);
  }, [data]);

  const tv_payment = async () => {
    if (user?.balance === 0 || (user?.balance as number) < billProps.amount) {
      toast({
        title: "ERROR 429",
        description: "Insufficient Balance",
      });
      return;
    }

    if (user?.disableAccount) {
      toast({
        title: "ERROR 400",
        description: "Account is disabled",
      });
      return;
    }

    if (user?.suspisiousLogin) {
      toast({
        title: "ERROR 401",
        description: "Cannot perform this action right now",
      });
      return;
    }

    setLoading(true);

    const payload = {
      biller_name: billProps.biller_name,
      amount: billProps.amount,
      card_number: card_number,
      otp: otp_or_password,
    };

    const res = await fetch("/api/flutterwave/buy-tv", {
      method: "POST",
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
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <DialogAlert
        title="TV Subscription"
        description="Select your biller type"
        button={
          <Button
            className="w-full h-[2.5rem]"
            borderRadius={true}
            name="Select Biller"
            onClick={() => {}}
            varient="filled"
            disabled={false}
          />
        }
        content={
          <div className="w-full mt-5 flex flex-col items-center justify-center gap-3 h-[25rem] overflow-auto">
            {is_loading ? (
              <Loaders width="10" addBackground={false} />
            ) : error ? (
              <p className="text-xl">Unable to get TV Subscription</p>
            ) : (
              billers.map((bill) => (
                <DialogClose className="w-full" key={bill.id}>
                  <Button
                    className="w-full h-[2.5rem]"
                    borderRadius={true}
                    name={bill.biller_name}
                    varient="outlined"
                    onClick={() =>
                      setBillProps({
                        biller_name: bill.biller_name,
                        item_code: bill.item_code,
                        amount: bill.amount,
                      })
                    }
                    disabled={false}
                  />
                </DialogClose>
              ))
            )}
          </div>
        }
      />

      <Input
        value={`${billProps.biller_name} - ${
          billProps.amount
            ? Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                minimumIntegerDigits: 2,
              }).format(billProps.amount)
            : ""
        }`}
        setValue={() => {}}
        disabled={true}
        type="text"
        placeholder="Your Biller"
      />
      <Input
        value={card_number}
        setValue={setCard_number}
        type="text"
        placeholder="Enter Smartcard Number"
      />
      {user?.settings.send_otp_for_each_transaction && (
        <Ask_authentication
          value={otp_or_password}
          setValue={setOtp_or_password}
        />
      )}
      <Button
        className="w-full h-[2.5rem]"
        borderRadius={true}
        name="Pay"
        states={loading ? "loading" : undefined}
        onClick={tv_payment}
        varient="danger"
        disabled={
          billProps.amount && billProps.biller_name && card_number
            ? false
            : true
        }
      />
    </div>
  );
};

export default Internet;
