import { useFormatDate } from "@/Hooks/useFormatDate";
import { useNairaFormatter } from "@/Hooks/useNairaFormatter";
import { historyProps } from "@/Models/user";
import React from "react";
import { AiFillPhone, AiOutlineArrowLeft } from "react-icons/ai";
import { BiMoney } from "react-icons/bi";
import SheetComp from "../sheet";
import { useStore } from "@/provider";
import Receipt from "../receipt";
import { SheetClose } from "../ui/sheet";

const History_comp = ({
  name,
  amount,
  date,
  type,
  status,
  refID,
  transactionFrom,
  transactionTo,
}: historyProps) => {
  const naira = useNairaFormatter(amount);
  const d = useFormatDate(date);
  const { is_darkmode } = useStore();

  const name_first_letter = (
    <div
      className={`w-[3rem] h-[3rem] flex items-center justify-center p-2 cursor-pointer rounded-full ${
        type === "credit"
          ? " bg-green-200 text-green-600"
          : " bg-red-200 text-red-600"
      } `}
    >
      <span className="font-semibold text-xl">
        {type === "airtime" ? (
          <AiFillPhone />
        ) : type === "bill payments" ? (
          <BiMoney />
        ) : (
          name[0].toUpperCase()
        )}
      </span>
    </div>
  );

  return (
    <SheetComp
      button={
        <div className="w-full rounded-sm sm:w-[30rem] p-2 ease-linear transition-all hover:dark:bg-slate-700 hover:bg-white cursor-pointer flex items-center justify-between ">
          <div className="flex items-center gap-3">
            {name_first_letter}
            <div className="flex flex-col">
              <p className="text-lg capitalize">{name}</p>
              <span className="font-semibold md:text-[0.8rem] text-base">
                {d}
              </span>
            </div>
          </div>

          <p
            className={`text-base ${
              type === "credit" ? "text-green-600" : " text-red-600"
            }`}
          >
            {naira}
          </p>
        </div>
      }
      header={
        <div
          className={`w-full flex items-center ${
            is_darkmode ? "glassmorph_darkmode" : "glassmorph"
          } px-1 py-2`}
        >
          <SheetClose className="">{<AiOutlineArrowLeft />}</SheetClose>
          <p className="w-full flex items-center justify-center text-2xl">
            Transaction Details
          </p>
        </div>
      }
    >
      <div className="w-full p-3">
        <Receipt
          key={refID}
          status={status}
          amount={amount}
          refNumber={refID}
          receiver={transactionTo as string}
          sender={transactionFrom as string}
          payment_type={type}
          payment_time={date}
        />
      </div>
    </SheetComp>
  );
};

export default History_comp;
