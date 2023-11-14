"use client";

import SlideIn from "@/components/Animations/slideIn";
import Header from "@/components/KYC/header";
import Button from "@/components/button";
import Input from "@/components/input";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/datePicker";
import { toast } from "@/components/ui/use-toast";

const Page = () => {
  const [nationality, setNationality] = useState<string | number>("");
  const [place_of_birth, setPlace_of_birth] = useState<string | number>("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [maritalStatus, setMaritalStatus] = useState<"single" | "married">(
    "single"
  );
  const [date_of_birth, setDateOfBirth] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const add_personal_details = async () => {
    setLoading(true);

    const payload = {
      nationality: nationality,
      gender: gender,
      place_of_birth: place_of_birth,
      marital_status: maritalStatus,
      date_of_birth: date_of_birth,
    };

    const res = await fetch("/api/kyc/personal-details", {
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

    router.push("/KYC/id-details");
  };

  return (
    <div className="w-full flex flex-col gap-3 h-full">
      <Header />
      <SlideIn>
        <span className="text-2xl p-1 text-purple-500">
          Welcome! complete your KYC registeration
        </span>
        <div className="w-full mt-3 p-1 flex items-center gap-3 flex-col h-full">
          <Input
            value={nationality as string}
            setValue={setNationality}
            type="text"
            disabled={false}
            error={false}
            placeholder="Nationality (Nigeria)"
          />
          <Input
            value={place_of_birth as string}
            setValue={setPlace_of_birth}
            type="text"
            disabled={false}
            error={false}
            placeholder="Place of birth (Lagos, Lekki)"
          />
          <DatePicker
            title="Enter your date of birth"
            date={date_of_birth as Date}
            setDate={setDateOfBirth}
          />
          <span className="w-full items-start justify-start flex text-lg">
            Gender
          </span>
          <div className="w-full flex items-center gap-2">
            <Button
              name="Male"
              onClick={() => setGender("male")}
              disabled={false}
              varient={gender === "male" ? "filled" : "outlined"}
              borderRadius={true}
              className="w-full h-[2.5rem]"
            />
            <Button
              name="Female"
              onClick={() => setGender("female")}
              disabled={false}
              varient={gender === "female" ? "filled" : "outlined"}
              borderRadius={true}
              className="w-full h-[2.5rem]"
            />
          </div>
          <span className="w-full items-start justify-start flex text-lg">
            Marital status
          </span>
          <div className="w-full flex items-center gap-2">
            <Button
              name="Single"
              onClick={() => setMaritalStatus("single")}
              disabled={false}
              varient={maritalStatus === "single" ? "filled" : "outlined"}
              borderRadius={true}
              className="w-full h-[2.5rem]"
            />
            <Button
              name="Married"
              onClick={() => setMaritalStatus("married")}
              disabled={false}
              varient={maritalStatus === "married" ? "filled" : "outlined"}
              borderRadius={true}
              className="w-full h-[2.5rem]"
            />
          </div>
          <div className="w-full flex mt-5 items-end justify-end gap-2">
            <Button
              name="Skip"
              onClick={() => {}}
              disabled={false}
              varient="outlined"
              borderRadius={true}
              className="w-1/4 h-[2.5rem]"
            />
            <Button
              name="Proceed"
              onClick={add_personal_details}
              disabled={
                maritalStatus &&
                nationality &&
                gender &&
                place_of_birth &&
                date_of_birth &&
                !loading
                  ? false
                  : true
              }
              varient="filled"
              states={loading ? "loading" : undefined}
              borderRadius={true}
              className="w-[10rem] h-[2.5rem]"
            />
          </div>
        </div>
      </SlideIn>
    </div>
  );
};

export default Page;
