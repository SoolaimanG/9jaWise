import React, { useState } from "react";
import { DialogAlert } from "../dialogAlert";
import Input from "../input";
import { CalendarCheck } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import TextArea from "../textArea";
import { DialogClose } from "@radix-ui/react-dialog";
import Button from "../button";
import { useStore } from "@/provider";
import { AiOutlinePlus } from "react-icons/ai";
import { IoReturnUpForward } from "react-icons/io5";
import { toast } from "../ui/use-toast";
import { donationProps } from "@/Models/donation";
import { addStatusMessage } from "./data";

const Donation_edit = ({
  donation_name,
  _id,
  date,
  target_amount,
  description,
}: donationProps) => {
  const [showDate, setShowDate] = useState(false);
  const [amount, setAmount] = useState<string | number>(target_amount);
  const [new_description, setNew_description] = useState(description);
  const [donationName, setDonationName] = useState<string | number>(
    donation_name
  );
  const [loading, setLoading] = useState(false);

  const disableButton = () => {
    return date &&
      (amount as number) > 0 &&
      new_description &&
      !loading &&
      donationName
      ? false
      : true;
  };

  const { try_refresh } = useStore();

  const update_campaign = async () => {
    setLoading(true);

    const payload = {
      donation_name: donationName,
      description: new_description,
      amount: amount,
      id: _id.toString(),
    };

    const res = await fetch("/api/donation/edit", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setLoading(false);
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText || addStatusMessage(res.status as 400),
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

  return (
    <DialogAlert
      title="Edit your donation campaign"
      description="Edit your campaign anytime your want to"
      button={<button className="underline">Edit</button>}
      content={
        <div className="w-full">
          <div className="w-full mt-3 flex flex-col gap-2">
            <Input
              value={donationName}
              setValue={setDonationName}
              type="text"
              placeholder="Donation Name"
            />
            <Input
              value={amount}
              setValue={setAmount}
              type="number"
              placeholder="Your donation target"
            />
            <div className="w-full relative">
              <button
                disabled
                onClick={() => setShowDate((prev) => !prev)}
                className="w-full hover:bg-gray-50 hover:dark:bg-slate-700 flex items-center gap-1 px-1 h-[2.5rem] disabled:cursor-not-allowed border border-gray-500 text-gray-500 dark:text-gray-300 rounded-md"
              >
                <CalendarCheck size={17} />
                {date
                  ? format(new Date(date).getTime(), "PPP")
                  : "Pick a dead line"}
              </button>
              {showDate && (
                <div className="absolute dark:bg-slate-900 bg-gray-100 bottom-0 left-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={() => {}}
                    onDayClick={() => {}}
                    initialFocus
                  />
                </div>
              )}
            </div>
            <TextArea
              value={new_description}
              setValue={setNew_description}
              height={5}
              placeholder="Your donation description"
              resize
            />
            <div className="w-full flex items-end justify-end">
              <Button
                className="px-4 py-2"
                icon={<AiOutlinePlus />}
                name="Republish"
                disabled={disableButton()}
                states={loading ? "loading" : undefined}
                varient="danger"
                onClick={update_campaign}
              />
            </div>
          </div>
        </div>
      }
    />
  );
};

export default Donation_edit;
