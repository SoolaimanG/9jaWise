"use client";

//----------->All Imports<-------------
import { useEffect, useState } from "react";
import Button from "../button";
import Input from "../input";
import { useStore } from "@/provider";
import { useFetchData } from "@/Hooks/useFetchData";
import Loaders from "../loaders";
import Ask_authentication from "./ask_authentication";
import { toast } from "../ui/use-toast";

//Networks Available
const networkType = ["MTN", "AIRTEL", "GLO", "9MOBILE"];

export type billerProps = {
  biller_code: string;
  name: string;
  default_commissions: string;
  biller_name: string;
  item_code: string;
  amount: number;
};

const Data = () => {
  //Get the categories of the bills with https://www.flutterwave.com API
  const { data, is_loading, error } = useFetchData<billerProps[]>({
    url: "http://localhost:8080/api/flutterwave/get-bill-categories",
  });

  const { is_darkmode, user, try_refresh } = useStore();

  const [phone_number, setPhone_Number] = useState<string | number>(
    user?.phoneNumber ? user.phoneNumber : ""
  );
  const [loading, setLoading] = useState(false);
  const [selectNtw, setSelectNtw] = useState("MTN");
  const [selectPlan, setSelectPlan] = useState("");
  const [mtnPlans, setMtnPlans] = useState<billerProps[] | undefined>([]);
  const [gloPlans, setGloPlans] = useState<billerProps[] | undefined>([]);
  const [airtelPlans, setAirtelPlans] = useState<billerProps[] | undefined>([]);
  const [nine_mobilePlans, setNine_MobilePlans] = useState<
    billerProps[] | undefined
  >([]);
  const [amount, setAmount] = useState(0);
  const [otp_or_password, setOtp_or_password] = useState<string | number>("");

  //Uncomponent mount or data change filter api according to user category
  useEffect(() => {
    const newData = data?.slice(5, 33);

    const filterMTN = newData?.filter((d) => {
      return d.name === "MTN DATA BUNDLE";
    });
    setMtnPlans(filterMTN);

    const filterGLO = newData?.filter((d) => {
      return d.name === "GLO DATA BUNDLE";
    });
    setGloPlans(filterGLO);

    const filterAIRTEL = newData?.filter((d) => {
      return d.name === "AIRTEL DATA BUNDLE";
    });
    setAirtelPlans(filterAIRTEL);

    const filternine_moile = newData?.filter((d) => {
      return d.name === "9MOBILE DATA BUNDLE";
    });
    setNine_MobilePlans(filternine_moile);
  }, [data]);

  //Organizing a disable function for the buy data button
  const shouldButtonBeDisabled = () => {
    return !is_loading &&
      !error &&
      data &&
      selectPlan &&
      networkType &&
      !loading &&
      !isNaN(Number(phone_number)) &&
      phone_number.toString().length >= 10
      ? false
      : true;
  };

  const buy_data = async () => {
    //Litte Client Checks
    if (user?.suspisiousLogin) {
      toast({
        title: `ERROR`,
        description: "Cannot perform this action right now",
        variant: "destructive",
      });
      return;
    }

    if ((user?.balance as number) < 0) {
      toast({
        title: `ERROR`,
        description: "Insufficient Balance",
        variant: "destructive",
      });
    }

    setLoading(true); //Start loading

    //payload needed to start operation
    const payload = {
      biller_code: selectPlan,
      amount: amount,
      number: phone_number,
      otp: otp_or_password,
    };

    //Start request
    const res = await fetch("/api/flutterwave/buy-data", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    //If the request !OK return by notifying the user
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
      title: `SUCCESS`,
      description: res.statusText,
    });
    try_refresh(); //Hard refresh to get updates data
  };

  //Plans to filter -->HEADER<---
  const plans = (
    <div className="w-full dark:bg-slate-900 p-2 rounded-md bg-gray-100">
      <p className="text-purple-500 text-xl font-semibold">Select Data Plan</p>
      <div className="grid mt-2 grid-cols-3 md:grid-cols-2 sm:grid-cols-2 gap-3 w-full">
        {selectNtw === "MTN" &&
          mtnPlans?.map((mtn) => (
            <div
              key={mtn.biller_name}
              onClick={() => {
                setSelectPlan(mtn.biller_name);
                setAmount(mtn.amount);
              }}
              className={`w-full flex p-2 ${
                is_darkmode
                  ? `${
                      mtn.biller_name === selectPlan
                        ? "bg-purple-700 text-white"
                        : "glassmorph_darkmode"
                    }`
                  : `${
                      mtn.biller_name === selectPlan
                        ? "bg-purple-700 text-white"
                        : " bg-gray-50"
                    }`
              } rounded-md  items-center cursor-pointer hover:bg-purple-500 hover:text-white transition-all ease-linear delay-75 justify-center flex-col gap-1`}
            >
              <strong className="md:text-[0.9rem] text-center sm:text-[0.8rem]">
                {mtn.biller_name}
              </strong>
              <p>
                {Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 2,
                }).format(mtn.amount)}
              </p>
            </div>
          ))}
        {selectNtw === "GLO" &&
          gloPlans?.map((glo) => (
            <div
              key={glo.biller_name}
              onClick={() => {
                setSelectPlan(glo.biller_name);
                setAmount(glo.amount);
              }}
              className={`w-full flex p-2 ${
                is_darkmode
                  ? `${
                      glo.biller_name === selectPlan
                        ? "bg-purple-700 text-white"
                        : "glassmorph_darkmode"
                    }`
                  : `${
                      glo.biller_name === selectPlan
                        ? "bg-purple-700 text-white"
                        : " bg-gray-50"
                    }`
              } rounded-md  items-center cursor-pointer hover:bg-purple-500 hover:text-white transition-all ease-linear delay-75 justify-center flex-col gap-1`}
            >
              <strong className="md:text-[0.9rem] text-center sm:text-[0.8rem]">
                {glo.biller_name}
              </strong>
              <p>
                {Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 2,
                }).format(glo.amount)}
              </p>
            </div>
          ))}
        {selectNtw === "AIRTEL" &&
          airtelPlans?.map((airtel) => (
            <div
              key={airtel.biller_name}
              onClick={() => {
                setSelectPlan(airtel.biller_name);
                setAmount(airtel.amount);
              }}
              className={`w-full flex p-2 ${
                is_darkmode
                  ? `${
                      airtel.biller_name === selectPlan
                        ? "bg-purple-700 text-white"
                        : "glassmorph_darkmode"
                    }`
                  : `${
                      airtel.biller_name === selectPlan
                        ? "bg-purple-700 text-white"
                        : " bg-gray-50"
                    }`
              } rounded-md  items-center cursor-pointer hover:bg-purple-500 hover:text-white transition-all ease-linear delay-75 justify-center flex-col gap-1`}
            >
              <strong className="md:text-[0.9rem] text-center sm:text-[0.8rem]">
                {airtel.biller_name}
              </strong>
              <p>
                {Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 2,
                }).format(airtel.amount)}
              </p>
            </div>
          ))}
        {selectNtw === "9MOBILE" &&
          nine_mobilePlans?.map((nine) => (
            <div
              key={nine.biller_name}
              onClick={() => {
                setSelectPlan(nine.biller_name);
                setAmount(nine.amount);
              }}
              className={`w-full flex p-2 ${
                is_darkmode
                  ? `${
                      nine.biller_name === selectPlan
                        ? "bg-purple-700 text-white"
                        : "glassmorph_darkmode"
                    }`
                  : `${
                      nine.biller_name === selectPlan
                        ? "bg-purple-700 text-white"
                        : " bg-gray-50"
                    }`
              } rounded-md  items-center cursor-pointer hover:bg-purple-500 hover:text-white transition-all ease-linear delay-75 justify-center flex-col gap-1`}
            >
              <strong className="md:text-[0.9rem] text-center sm:text-[0.8rem]">
                {nine.biller_name}
              </strong>
              <p>
                {Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 2,
                }).format(nine.amount)}
              </p>
            </div>
          ))}
      </div>
    </div>
  );

  //Networks to display according to the defined network above
  const networks = (
    <div className="w-full flex gap-2 items-center justify-between">
      {networkType.map((_) => (
        <Button
          key={_}
          className="w-full h-[2.5rem]"
          name={_}
          varient={selectNtw === _ ? "filled" : "outlined"}
          disabled={false}
          onClick={() => setSelectNtw(_)}
          borderRadius={true}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-3">
      <Input
        value={phone_number}
        setValue={setPhone_Number}
        type="text"
        error={false}
        disabled={false}
        placeholder="Enter Phone Number"
      />
      {is_loading ? (
        <div className="w-full flex items-center justify-center">
          <Loaders width="10" addBackground={false} />
        </div>
      ) : error ? (
        <p className="text-lg text-red-600">Unable to get plans</p>
      ) : (
        <div className="w-full flex flex-col gap-3">
          {networks}
          {plans}
        </div>
      )}
      <Ask_authentication
        value={otp_or_password}
        setValue={setOtp_or_password}
      />
      <Button
        name="Buy data"
        className="h-[2.5rem] w-full"
        borderRadius={true}
        states={loading ? "loading" : undefined}
        disabled={shouldButtonBeDisabled()}
        varient="filled"
        onClick={buy_data}
      />
    </div>
  );
};

export default Data;
