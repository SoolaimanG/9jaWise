"use client";

import { useNairaFormatter } from "@/Hooks/useNairaFormatter";
import Button from "@/components/button";
import Input from "@/components/input";
import ProgressComp from "@/components/progress";
import { useStore } from "@/provider";
import { Clipboard } from "lucide-react";
import React, { useState } from "react";

const Page = ({ params: { id } }: { params: { id: string } }) => {
  const [read_more, setRead_more] = useState(false);
  const { donation } = useStore();

  console.log(donation);

  const d = donation.find((_) => {
    return _.id === id;
  });

  if (!d) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>404 Not Found</p>
      </div>
    );
  }

  const t = useNairaFormatter(d.target_amount);
  const r = useNairaFormatter(d.amount_raised);

  return (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
      <div className="flex w-[60%] h-full gradient-two md:hidden sm:hidden"></div>
      <div className="w-[40%] flex flex-col gap-3 md:w-full h-full sm:w-full p-2 bg-white shadow-md rounded-md">
        <p className="text-xl sm:text-[1rem] text-purple-700">
          Hey there! Let's help Soolaiman reach his goal
        </p>
        <div className="flex p-2 flex-col bg-gray-100 rounded-md shadow-md gap-1">
          <div className="w-full flex items-center justify-between">
            <p>Amount raised {r}</p>
            <p>Target amount {t}</p>
          </div>
          <ProgressComp value={d.amount_raised} max={d.target_amount} />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-2xl text-purple-700 sm:text-lg">Buy Laptop</p>
          <div className="flex items-center gap-1">
            <p className="text-xl font-semibold">Time left:</p>
            <span> 20min</span>
          </div>
        </div>
        <div className="flex flex-col p-2 bg-gray-100 rounded-md shadow-md gap-1">
          <div className="w-full flex items-center justify-between">
            <p className="text-xl font-semibold">Note</p>
            <button
              onClick={() => setRead_more(!read_more)}
              className="underline text-base"
            >
              Read more
            </button>
          </div>
          {read_more && <div className="w-full">{d.description}</div>}
        </div>
        <div className="flex items-center gap-1">
          {" "}
          <strong className="text-purple-600 text-xl">
            {d.donators.length}
          </strong>{" "}
          <p className="text-[0.9rem]">People have donated to this</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={d.account_number}
            disabled
            type="text"
            setValue={() => {}}
          />
          <Button
            className="h-[2.5rem] px-3"
            borderRadius
            name=""
            icon={<Clipboard size={18} />}
            varient="outlined"
            disabled={false}
            onClick={() => {}}
          />
        </div>
        <div className="flex items-center gap-2">
          <Input value={d.bank_name} disabled type="text" setValue={() => {}} />
          <Button
            className="h-[2.5rem] px-3"
            borderRadius
            name=""
            icon={<Clipboard size={18} />}
            varient="outlined"
            disabled={false}
            onClick={() => {}}
          />
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={d.account_name}
            disabled
            type="text"
            setValue={() => {}}
          />
          <Button
            className="h-[2.5rem] px-3"
            borderRadius
            name=""
            icon={<Clipboard size={18} />}
            varient="outlined"
            disabled={false}
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
