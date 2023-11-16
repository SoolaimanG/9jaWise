"use client";

//----------------->All Imports<--------------------
import { AiOutlinePlus } from "react-icons/ai";
import Button from "../button";
import { DialogAlert } from "../dialogAlert";
import { useNairaFormatter } from "@/Hooks/useNairaFormatter";
import { useScreenSize } from "@/Hooks/useScreenSize";
import { DialogDescription, DialogTitle } from "../ui/dialog";
import Input from "../input";
import { CalendarCheck } from "lucide-react";
import { useState } from "react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import TextArea from "../textArea";
import { useStore } from "@/provider";
import { useToast } from "../ui/use-toast";
import FadeIn from "../Animations/fadeIn";
import Donation_content from "./donation_content";
import { addStatusMessage } from "./data";

const Donation = () => {
  //----------->States needs to created a donation<------------
  const [showDate, setShowDate] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [amount, setAmount] = useState<string | number>(0);
  const [description, setDescription] = useState("");
  const [donationName, setDonationName] = useState<string | number>("");

  //Hooks and methods for storing user properties and toast notifications
  const { x } = useScreenSize();
  const { user, try_refresh } = useStore();
  const { toast } = useToast();

  //-------->Tracking request states<-----------
  const [loading, setLoading] = useState(false);

  const disableButton = () => {
    return date &&
      (amount as number) > 0 &&
      description &&
      !loading &&
      donationName
      ? false
      : true;
  };

  //Create a new donation
  const create_donation = async () => {
    //if the email is not verified do not allow action
    if (!user?.emailVerified) {
      return toast({
        title: `ERROR 400`,
        description: "Verify your email and try again",
        variant: "destructive",
      });
    }

    //Checking if the user has an account number already assign to him/her if not do not allow
    if (user?.account.accountNumber) {
      return toast({
        title: `ERROR 400`,
        description: "KYC already completed",
        variant: "destructive",
      });
    }

    setLoading(true); //Start Loading

    //Payload need to create a new subaccount
    const payload = {
      target_amount: amount,
      description: description,
      donation_name: donationName,
      date: date,
    };

    //Sending request to http://localhost:8080/api/donation/generate-donation-account to create one
    const res = await fetch("/api/donation/generate-donation-account", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    //The request was !OK
    if (!res.ok) {
      setLoading(false);
      toast({
        title: `ERROR ${res.status}`,
        description: addStatusMessage(res.status as 400),
        variant: "destructive",
      });
      return;
    }

    //The request was successful
    setLoading(false);
    toast({
      title: "SUCCESS",
      description: "Donation Campaign Created",
    });
    try_refresh(); //Perform hard refresh
  };

  //Calculating the total money made from donations
  const all_donation_funds = user?.donation_campaigns.reduce((curr, acc) => {
    return curr + acc.amount_raised;
  }, 0);

  const total_donations = useNairaFormatter(all_donation_funds || 0); //Format the money from total donations

  return (
    <FadeIn className="w-full px-2 py-4 mt-2 rounded-md dark:bg-slate-900 bg-gray-100">
      <div className="w-full flex items-center justify-between">
        <div className="flex gap-1 items-center">
          <span className="sm:hidden">Total Donations:</span>
          <strong className="wordGradient text-xl">{total_donations}</strong>
        </div>
        <DialogAlert
          button={
            <Button
              className="px-3 py-1 md:py-2"
              borderRadius={true}
              icon={<AiOutlinePlus />}
              onClick={() => {}}
              name={x > 500 ? "Donation" : ""}
              disabled={false}
              varient="filled"
            />
          }
          content={
            <div className="w-full">
              <DialogTitle className="text-xl text-center w-full">
                Create Donation Link
              </DialogTitle>
              <DialogDescription className="text-center">
                you can create a link for people to donation money.
              </DialogDescription>
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
                    onClick={() => setShowDate((prev) => !prev)}
                    className="w-full hover:bg-gray-50 hover:dark:bg-slate-700 flex items-center gap-1 px-1 h-[2.5rem] border border-gray-500 text-gray-500 dark:text-gray-300 rounded-md"
                  >
                    <CalendarCheck size={17} />
                    {date ? format(date, "PPP") : "Pick a dead line"}
                  </button>
                  {showDate && (
                    <div className="absolute dark:bg-slate-900 bg-gray-100 bottom-0 left-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        onDayClick={() => setShowDate(false)}
                        initialFocus
                      />
                    </div>
                  )}
                </div>
                <TextArea
                  value={description}
                  setValue={setDescription}
                  height={5}
                  placeholder="Your donation description"
                  resize
                />
                <div className="w-full flex items-end justify-end">
                  <Button
                    className="px-4 py-2"
                    icon={<AiOutlinePlus />}
                    name="Generate Link"
                    states={loading ? "loading" : undefined}
                    disabled={disableButton()}
                    varient="filled"
                    onClick={create_donation}
                    borderRadius
                  />
                </div>
              </div>
            </div>
          }
        />
      </div>
      <Donation_content />
    </FadeIn>
  );
};

export default Donation;
