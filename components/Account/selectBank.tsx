import React, { SetStateAction, useEffect, useState } from "react";
import SheetComp from "../sheet";
import { IoIosArrowForward } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import { SheetClose } from "../ui/sheet";
import { RiSearchLine } from "react-icons/ri";
import Spinner from "../Loaders/spinner";
import { useFetchData } from "@/Hooks/useFetchData";

export type selectBankProps = {
  selected: string;
  setSelected: React.Dispatch<SetStateAction<string | number>>;
  setBank_code: React.Dispatch<SetStateAction<string>>;
};

export type bankResProps = {
  code: string;
  name: string;
  id?: number;
};

const popularBanks = [
  {
    name: "9JA WISE BANK",
    account_bank: "01",
  },
  {
    name: "Access Bank",
    account_bank: "044",
  },
  {
    name: "UBA",
    account_bank: "033",
  },
  {
    name: "First Bank Of Nigeria",
    account_bank: "011",
  },
  {
    name: "Zenith Bank",
    account_bank: "057",
  },
];

const SelectBank = ({
  selected,
  setSelected,
  setBank_code,
}: selectBankProps) => {
  const [bankList, setBankList] = useState<bankResProps[]>([]);
  const [q, setQ] = useState("");

  const { error, data, is_loading } = useFetchData<bankResProps[]>({
    url: `${process.env.NEXT_PUBLIC_URL}/api/flutterwave/get-all-banks`,
    retry: true,
    interval: 10000,
  });

  useEffect(() => {
    const filter = data?.filter((d) => {
      return d.name.toLowerCase().includes(q.toLowerCase());
    });

    if (!filter) {
      return;
    }

    setBankList(filter);
  }, [q, data]);

  return (
    <div>
      <SheetComp
        header={
          <div className="p-2 w-full flex items-center">
            <p className="text-gray-500 text-xl dark:text-gray-300 text-center w-full">
              Select Bank
            </p>
            <span className="flex items-end justify-end">
              <SheetClose>
                <AiOutlineClose size={20} />
              </SheetClose>
            </span>
          </div>
        }
        button={
          <button className="w-full h-[2.5rem] rounded-md border border-purple-700 bg-transparent flex items-center px-2 justify-between">
            {selected ? selected : "Select Bank"}
            <IoIosArrowForward size={20} />
          </button>
        }
      >
        <div className="p-2 flex flex-col gap-3">
          <div className="w-full p-1 flex h-[2.5rem] items-center border border-purple-500 rounded-md gap-2">
            <RiSearchLine size={20} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="text"
              className="w-full h-full bg-transparent outline-none"
              placeholder="Search Bank Name..."
            />
          </div>
          <div className="w-full flex flex-col gap-2 h-fit">
            <p className="text-xl text-gray-500 dark:text-gray-300">
              Frequently used banks
            </p>
            <div className="w-full grid gap-2 grid-cols-3 grid-rows-2">
              {popularBanks.map((popular) => (
                <SheetClose
                  onClick={() => {
                    setSelected(popular.name);
                    setBank_code(popular.account_bank);
                  }}
                  className={`flex border justify-center hover:bg-purple-500 transition-all delay-75 ease-linear hover:text-white cursor-pointer ${
                    selected === popular.name && "bg-purple-500 text-white"
                  } border-purple-500 rounded-md p-1 flex-col gap-1 items-center`}
                  key={popular.name}
                >
                  <p className="text-xl font-semibold">{popular.name[0]}</p>
                  <span className="text-center w-full">{popular.name}</span>
                </SheetClose>
              ))}
            </div>
          </div>
          {/* Get Banks */}
          <div className="w-full mt-3">
            {is_loading ? (
              <div className="item-center justify-center flex w-full">
                <Spinner />
              </div>
            ) : error ? (
              <div>
                <p>Unable to get banks</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {bankList?.map((bank) => (
                  <SheetClose
                    key={bank.id}
                    onClick={() => {
                      setSelected(bank.name);
                      setBank_code(bank.code);
                    }}
                    className={`text-xl w-full flex items-center ${
                      selected === bank.name && "text-purple-500"
                    } cursor-pointer gap-2 hover:text-purple-500 transition-all delay-75 ease-linear`}
                  >
                    <span className="w-[2.5rem] flex items-center justify-center h-[2.5rem] rounded-full dark:bg-slate-900 bg-gray-200">
                      {bank.name[0]}
                    </span>
                    <p className="text-left"> {bank.name}</p>
                  </SheetClose>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetComp>
    </div>
  );
};

export default SelectBank;
