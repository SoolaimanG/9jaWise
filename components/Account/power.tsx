import React, { useEffect, useState } from "react";
import Button from "../button";
import { DialogAlert } from "../dialogAlert";
import Input from "../input";
import { DialogClose } from "@radix-ui/react-dialog";
import { useFetchData } from "@/Hooks/useFetchData";
import Loaders from "../loaders";
import Ask_authentication from "./ask_authentication";
import { toast } from "../ui/use-toast";
import { useStore } from "@/provider";

const plans = [
  {
    amount: 1000,
  },
  {
    amount: 2000,
  },
  {
    amount: 3000,
  },
  {
    amount: 4000,
  },
  {
    amount: 5000,
  },
  {
    amount: 6000,
  },
];

type billerTypes = {
  id?: number;
  label_name: string;
  country: "NG";
  name: string;
  biller_name: string;
};

const Power = () => {
  const { user, try_refresh } = useStore();

  const [amount, setAmount] = useState<string | number>("");
  const [provider, setProvider] = useState<string | number>("");
  const [meterNumber, setMeterNumber] = useState<string | number>("");
  const [type, setType] = useState<"prepaid" | "postpaid">("prepaid");
  const [billers, setBillers] = useState<billerTypes[]>([]);
  const [otp_or_password, setOtp_or_password] = useState<string | number>("");

  const { is_loading, data, error } = useFetchData<billerTypes[]>({
    url: "http://localhost:8000/api/flutterwave/get-bill-categories",
    retry: true,
    interval: 3000,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const filter = data?.filter((d) => {
      return d.label_name === "Meter Number" && d.country === "NG";
    });

    if (!filter) {
      return;
    }

    setBillers(filter);
  }, [data]);

  const buy_power = async () => {
    if ((user?.balance as number) < (amount as number)) {
      toast({
        title: `ERROR`,
        description: "Insufficient Balance",
        variant: "destructive",
      });
      return;
    }

    if (user?.suspisiousLogin) {
      toast({
        title: `ERROR`,
        description: "Cannot perform this action right now",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const payload = {
      company: provider,
      paymentType: type,
      amount: amount,
      meter_number: meterNumber,
      otp: otp_or_password,
    };

    const res = await fetch("/api/flutterwave/buy-power", {
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
    try_refresh();
  };

  const powerPlans = (
    <div className="w-full grid grid-cols-3 gap-3 md:grid-cols-2 sm:grid-cols-1">
      {plans.map((p, _) => (
        <div className="w-full" key={_}>
          <Button
            className="w-full h-[2.5rem]"
            borderRadius={true}
            name={Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              minimumFractionDigits: 2,
            }).format(p.amount)}
            onClick={() => setAmount(p.amount)}
            disabled={false}
            varient={p.amount === amount ? "filled" : "outlined"}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-3">
      <DialogAlert
        button={
          <Button
            borderRadius={true}
            className="w-full h-[2.5rem]"
            name="Select Company"
            disabled={false}
            varient="filled"
            onClick={() => {}}
          />
        }
        title="Select Power Company"
        description="Select your electricity provider"
        content={
          <div className="w-full h-[20rem] overflow-auto flex flex-col gap-3">
            {is_loading ? (
              <div className="w-full flex items-center gap-1 justify-center">
                <p>Loading...</p> <Loaders width="10" addBackground={false} />
              </div>
            ) : error ? (
              <p className="text-lg text-red-600">
                Unable to fetch power providers
              </p>
            ) : (
              billers.map((type) => (
                <DialogClose key={type.id} className="w-full">
                  <Button
                    name={type.name}
                    onClick={() => setProvider(type.biller_name)}
                    varient="outlined"
                    disabled={false}
                    className="w-full h-[2.5rem]"
                  />
                </DialogClose>
              ))
            )}
          </div>
        }
      />
      <Input
        placeholder="Selected Company"
        value={provider}
        disabled={true}
        color={true}
        setValue={() => {}}
        type="text"
      />
      <div className="w-full flex flex-col gap-2">
        <p className="text-xl text-purple-700">Payment Type</p>
        <div className="w-full flex items-center gap-3">
          <Button
            borderRadius={true}
            className="w-full h-[2.5rem]"
            name="Prepaid"
            disabled={false}
            varient={type === "prepaid" ? "filled" : "outlined"}
            onClick={() => setType("prepaid")}
          />
          <Button
            borderRadius={true}
            className="w-full h-[2.5rem]"
            name="Postpaid"
            disabled={false}
            varient={type === "postpaid" ? "filled" : "outlined"}
            onClick={() => setType("postpaid")}
          />
        </div>
        <p className="text-xl text-purple-700">Select Amount</p>
        {powerPlans}
      </div>
      <Input
        placeholder="Enter your meter number"
        value={meterNumber}
        setValue={setMeterNumber}
        type="text"
      />
      <Input
        placeholder="Enter Amount"
        value={amount}
        setValue={setAmount}
        type="text"
      />
      <Ask_authentication
        value={otp_or_password}
        setValue={setOtp_or_password}
      />
      <Button
        borderRadius={true}
        className="w-full h-[2.5rem]"
        states={loading ? "loading" : undefined}
        name="Pay"
        disabled={
          amount && meterNumber.toString().length >= 10 && provider
            ? false
            : true
        }
        varient="danger"
        onClick={buy_power}
      />
    </div>
  );
};

export default Power;
