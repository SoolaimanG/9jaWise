"use client";

import SlideIn from "@/components/Animations/slideIn";
import Header from "@/components/KYC/header";
import Button from "@/components/button";
import Input from "@/components/input";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Page = () => {
  const [state, setState] = useState<string | number>("");
  const [city, setCity] = useState<string | number>("");
  const [streetAddress, setStreetAddress] = useState<string | number>("");
  const [nextOfKin, setNextOfKin] = useState<string | number>("");
  const [nok_name, setNok_name] = useState<string | number>("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const add_id_details = async () => {
    setLoading(true);
    const payload = {
      state: state,
      street_address: streetAddress,
      city: city,
      nextOfKin: nextOfKin,
      nokName: nok_name,
    };

    const res = await fetch("/api/kyc/id-details", {
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
    router.push("/KYC/bank-details");
  };

  return (
    <div className="w-full flex flex-col gap-3 h-full">
      <Header />
      <SlideIn>
        <span className="text-2xl p-1 text-purple-500">
          Identification process
        </span>
        <div className="w-full mt-3 p-1 flex items-center gap-3 flex-col h-full">
          <Input
            value={state as string}
            setValue={setState}
            type="text"
            disabled={false}
            error={false}
            placeholder="State"
          />
          <Input
            value={city as string}
            setValue={setCity}
            type="text"
            disabled={false}
            error={false}
            placeholder="City"
          />
          <Input
            value={streetAddress as string}
            setValue={setStreetAddress}
            type="text"
            disabled={false}
            error={false}
            placeholder="Street address"
          />
          <Input
            value={nextOfKin}
            setValue={setNextOfKin}
            type="text"
            disabled={false}
            error={false}
            placeholder="Next of kin"
          />
          <Input
            value={nok_name as string}
            setValue={setNok_name}
            type="text"
            disabled={false}
            error={false}
            placeholder="Next of kin name"
          />

          <div className="w-full flex mt-5 items-end justify-end gap-2">
            <Button
              name="Back"
              onClick={() => router.back()}
              disabled={false}
              varient="outlined"
              borderRadius={true}
              className="w-1/4 h-[2.5rem]"
            />
            <Button
              name="Proceed"
              onClick={add_id_details}
              disabled={
                streetAddress &&
                nextOfKin &&
                nok_name &&
                city &&
                state &&
                !loading
                  ? false
                  : true
              }
              varient="filled"
              states={loading ? "loading" : undefined}
              borderRadius={true}
              className="w-[20rem] h-[2.5rem]"
            />
          </div>
        </div>
      </SlideIn>
    </div>
  );
};

export default Page;
