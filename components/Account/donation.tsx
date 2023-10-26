"use client";

import { AiOutlinePlus } from "react-icons/ai";
import Button from "../button";
import { DialogAlert } from "../dialogAlert";
import { useNairaFormatter } from "@/Hooks/useNairaFormatter";
import { useScreenSize } from "@/Hooks/useScreenSize";
import EmptyState from "./emptyState";
import { DialogDescription, DialogTitle } from "../ui/dialog";
import Input from "../input";
import { CalendarCheck } from "lucide-react";
import { useState } from "react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import TextArea from "../textArea";
import { donationProps, useStore } from "@/provider";
import { v4 as uuid } from "uuid";
import { useToast } from "../ui/use-toast";
import { DialogClose } from "@radix-ui/react-dialog";
import { LiaTelegramPlane } from "react-icons/lia";
import SheetComp from "../sheet";
import { Modal } from "../modal";
import { AlertDialogDescription, AlertDialogTitle } from "../ui/alert-dialog";
import { CgArrowLongLeft } from "react-icons/cg";
import { SheetClose, SheetDescription } from "../ui/sheet";
import ProgressComp from "../progress";
import FadeIn from "../Animations/fadeIn";

const Donation = () => {
  const [showDate, setShowDate] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [amount, setAmount] = useState<string | number>(0);
  const [description, setDescription] = useState("");
  const [donationName, setDonationName] = useState<string | number>("");
  const [loading, setLoading] = useState(false);

  const total_donations = useNairaFormatter(0);
  const { x } = useScreenSize();

  const { delete_donation, is_darkmode, user, try_refresh } = useStore();
  const { toast } = useToast();

  const disableButton = () => {
    return date &&
      (amount as number) > 0 &&
      description &&
      !loading &&
      donationName
      ? false
      : true;
  };

  const delete_link = (id: string) => {
    delete_donation(id);
    toast({
      title: "Link Deleted successfully",
      variant: "destructive",
    });
  };

  const share = ({
    name,
    desc,
    url,
  }: {
    name: string;
    desc: string;
    url: string;
  }) => {
    //
    if (navigator.canShare()) {
      return;
    }

    navigator.share({
      text: name,
      title: desc,
      url: url,
    });
  };

  const create_donation = async () => {
    if (user?.suspisiousLogin) {
      return toast({
        title: "ERROR 400",
        description: "Cannot perform this action right now",
      });
    }

    setLoading(true);

    const payload = {
      target_amount: amount,
      description: description,
      donation_name: donationName,
    };

    const res = await fetch("/api/donation/generate-donation-account", {
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
      <div className="w-full mt-5">
        {(user?.donation_campaigns.length as number) <= 0 ||
        !user?.donation_campaigns ? (
          <EmptyState message="No donation link created" />
        ) : (
          <div className="w-full flex flex-col gap-5">
            {user?.donation_campaigns.map((d) => {
              const n = useNairaFormatter(d.target_amount);
              const r = useNairaFormatter(d.amount_raised);
              return (
                <div
                  key={d.id}
                  className={`w-full flex-col gap-1 -mt-2 ${
                    is_darkmode
                      ? "cardGlassmorphism_dark"
                      : "cardGlassmorphism_light"
                  } flex p-2`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-purple-600 text-2xl font-semibold">
                      {d.donation_name.length > 20
                        ? d.donation_name.slice(0, 20) + "..."
                        : d.donation_name}
                    </p>
                    <strong className="text-purple-500 wordGradient">
                      {n}
                    </strong>
                  </div>
                  <span className="text-base">{d.donation_link}</span>
                  <div className="w-full flex gap-3">
                    <DialogAlert
                      title="Edit your donation campaign"
                      description="Edit your campaign anytime your want to"
                      button={<button className="underline">Edit</button>}
                      content={
                        <div className="w-full">
                          <div className="w-full mt-3 flex flex-col gap-2">
                            <Input
                              value={d.donation_name}
                              setValue={setDonationName}
                              type="text"
                              placeholder="Donation Name"
                            />
                            <Input
                              value={d.target_amount}
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
                                  ? format(d.date, "PPP")
                                  : "Pick a dead line"}
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
                              <DialogClose>
                                <Button
                                  className="px-4 py-2"
                                  icon={<AiOutlinePlus />}
                                  name="Republish"
                                  disabled={disableButton()}
                                  varient="danger"
                                  onClick={() => {}}
                                />
                              </DialogClose>
                            </div>
                          </div>
                        </div>
                      }
                    />

                    <SheetComp
                      button={
                        <button className=" underline text-base">View</button>
                      }
                      header={
                        <div className="w-full gradient-one p-2 flex items-center">
                          <SheetClose className="text-white">
                            <CgArrowLongLeft size={20} />
                          </SheetClose>
                          <p className="w-full text-white text-xl sm:text-lg flex items-center justify-center">
                            Donation Details
                          </p>
                        </div>
                      }
                    >
                      <div className="w-full h-full flex flex-col gap-3 p-2">
                        <SheetDescription className="text-center text-base">
                          {d.donation_name}
                        </SheetDescription>
                        <div className="w-full flex items-center justify-between">
                          <p className="text-xl sm:text-lg">Target amount</p>
                          <p className="font-semibold wordGradient">{n}</p>
                        </div>
                        <div className="w-full flex items-center justify-between">
                          <p className="text-xl sm:text-lg">Amount raised</p>
                          <p className="font-semibold wordGradient">{r}</p>
                        </div>
                        <div className="w-full flex items-center justify-between">
                          <p className="text-xl sm:text-lg">
                            Numbers of donators
                          </p>
                          <p className="font-semibold wordGradient">
                            {d.donators.length}
                          </p>
                        </div>
                        {d.donators.length >= 1 && (
                          <div className="w-full flex flex-col gap-2">
                            <p className="text-xl sm:text-lg">
                              List of donators
                            </p>
                            <div className="font-semibold w-full">
                              {d.donators.map((_, i) => (
                                <div
                                  key={i}
                                  className="flex p-2 rounded-md items-center justify-between bg-gray-100 dark:bg-slate-900 w-full"
                                >
                                  <p>{_.name}</p>
                                  <p className="wordGradient">{_.name}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="w-full flex flex-col gap-1">
                          <p className="text-xl font-semibold sm:text-lg">
                            Description
                          </p>
                          <p className="dark:text-gray-300 text-gray-500">
                            {d.description}
                          </p>
                        </div>
                        <div className="w-full">
                          <div className="w-full flex items-center justify-between">
                            <p>Raised: {r}</p>
                            <p>Target amount: {n}</p>
                          </div>
                          <ProgressComp
                            max={d.target_amount}
                            value={d.amount_raised}
                          />
                        </div>
                        <div className="w-full h-full flex flex-col items-end gap-2 justify-end">
                          <div className="w-full flex items-center gap-2">
                            <Button
                              className="h-[2.5rem] w-full"
                              name="Share"
                              icon={<LiaTelegramPlane />}
                              disabled={false}
                              onClick={() =>
                                share({
                                  name: d.donation_name,
                                  desc: d.description,
                                  url: d.donation_link,
                                })
                              }
                              varient="warning"
                              borderRadius
                            />
                            <Button
                              className="w-full h-[2.5rem]"
                              name="Withdraw"
                              borderRadius
                              disabled={false}
                              varient="filled"
                              onClick={() => {}}
                            />
                          </div>
                          <Modal
                            button={
                              <Button
                                className="w-full h-[2.5rem]"
                                name="Delete"
                                disabled={false}
                                onClick={() => {}}
                                varient="danger"
                                borderRadius
                              />
                            }
                            content={
                              <div className="w-full">
                                <AlertDialogTitle className="text-center text-base">
                                  Are you sure you want to delete this campaign?
                                </AlertDialogTitle>
                                <div className="mt-2 flex flex-col gap-1">
                                  <p className="text-[1.2rem] text-red-500">
                                    Things to note:
                                  </p>
                                  <AlertDialogDescription>
                                    After deletion link will no longer be
                                    visible to people
                                  </AlertDialogDescription>
                                  <AlertDialogDescription>
                                    If money is available in the link it will be
                                    move to your balance
                                  </AlertDialogDescription>
                                  <AlertDialogDescription>
                                    This action cannot be undone
                                  </AlertDialogDescription>
                                </div>
                              </div>
                            }
                            actionBtn="Delete Link"
                            action={() => {
                              setTimeout(() => {
                                delete_link(d.id);
                              }, 2000);
                            }}
                          />
                        </div>
                      </div>
                    </SheetComp>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </FadeIn>
  );
};

export default Donation;
