"use client";

import TextStreamer from "@/Functions/TSX/textStream";
import useClipboard from "@/Hooks/useClipboard";
import { useNairaFormatter } from "@/Hooks/useNairaFormatter";
import { donationProps } from "@/Models/donation";
import { addStatusMessage } from "@/components/Account/data";
import Button from "@/components/button";
import Loaders from "@/components/loaders";
import ProgressComp from "@/components/progress";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BiShare } from "react-icons/bi";

//Quotes for users
const donationQuotes = [
  "The joy of giving is immeasurable. Your act of generosity can make a world of difference in someone's life.",
  "We rise by lifting others. Your contribution, no matter how small, has the power to create a brighter, more compassionate world.",
  "Donating is not about how much you give, but how much love you put into giving. Your kindness has the potential to change lives and leave a lasting impact.",
  "Generosity is the seed of kindness. Plant it today and watch compassion bloom in the hearts of those in need.",
  "The world is full of givers and takers. Be a giver, for it is in giving that we find true wealth and purpose.",
  "A small donation can have a big impact. It's not about the size of your gift but the size of your heart.",
  "Your kindness can turn someone's despair into hope, their darkness into light. Embrace the power of giving.",
  "Generosity knows no bounds. Your generosity knows no limits. Be the change you want to see in the world.",
];

const Page = ({ params: { id } }: { params: { id: string } }) => {
  const banner =
    "https://i.ibb.co/QFCg9bH/pexels-rdne-stock-project-6646918-1-1.jpg"; //The image banner ------->[From https://www.FreePic.com]
  const [pick_qoute, setPick_qoute] = useState(0);
  const [donation, setDonation] = useState<donationProps | null>(null);

  const { copyToClipboard } = useClipboard();
  const router = useRouter();

  useEffect(() => {
    const random_length = donationQuotes.length;

    const timer = setInterval(() => {
      let random_num = Math.floor(Math.random() * random_length);

      setPick_qoute((prev) => {
        return prev === random_num
          ? Math.floor(Math.random() * random_length)
          : random_num;
      });
    }, 6500);

    const get_donation_data = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/GETS/donation/single?id=${id}`
      );

      if (res.status === 404) {
        router.push("/not-found");
        return;
      }

      if (!res.ok) {
        toast({
          title: `ERROR ${res.status}`,
          description: res.statusText || addStatusMessage(res.status as 400),
          variant: "destructive",
          action: (
            <ToastAction altText="Get donation" onClick={get_donation_data}>
              Retry
            </ToastAction>
          ),
        });
        return;
      }

      const donation: { donation: donationProps } = await res.json();

      setDonation(donation.donation);
    };

    get_donation_data();

    return () => clearInterval(timer);
  }, [id]);

  const encouragement_note = (
    <div className="w-[65%] glassmorph_darkmode p-2 rounded-md">
      <h2 className="text-xl sm:text-base text-white">
        Opening this requires a courageous move.
      </h2>
      <div className="text-gray-300">
        <TextStreamer speed={9} text={donationQuotes[pick_qoute]} />
      </div>
    </div>
  );

  const share = () => {
    if (navigator.canShare()) {
      return toast({
        title: "ERROR",
        description: "Browser does not support sharing",
        variant: "destructive",
      });
    }

    //TODO: dynamic value here!
    navigator.share({
      text: "",
      title: "",
      url: window.location.href,
    });
  };

  const t = useNairaFormatter(donation?.target_amount || 0);
  const r = useNairaFormatter(donation?.amount_raised || 0);

  return (
    <>
      {!donation ? (
        <div className="w-screen h-screen flex items-center justify-center">
          <Loaders width="40" addBackground={false} />
        </div>
      ) : (
        <div className="w-full overflow-hidden md:flex-col sm:flex-col h-screen bg-slate-700 flex items-center justify-center">
          <div
            style={{ backgroundImage: `url('${banner}')` }}
            className="flex w-[60%] md:w-full sm:w-full bg-center relative bg-no-repeat bg-cover h-full md:h-[40%] sm:h-[40%] bg-[url]"
          >
            {/* Gradient */}
            <div className="w-full h-full gradient_overlay absolute" />
            <div className="w-full md:hidden sm:hidden p-3 h-full flex items-end justify-start">
              {encouragement_note}
            </div>
          </div>
          <div className="w-[40%] flex overflow-auto flex-col gap-3 md:w-full h-full sm:w-full p-2 bg-white text-slate-700 shadow-md rounded-md">
            <div className="w-full">
              <p className="text-2xl wordGradient text-center sm:text-base">
                9JA WISE DONATION SCHEME
              </p>
              <span className="text-[0.9rem] text-purple-800 sm:text-[0.8rem] w-full flex items-center justify-center">
                Help reach goal!!!
              </span>
            </div>
            <div className="flex px-2  py-4 flex-col rounded-md hover:shadow-md transition-all delay-75 ease-linear gap-1">
              <div className="w-full flex items-center justify-between">
                <p className="sm:text-[0.7rem]">Raised {r}</p>
                <p className="sm:text-[0.7rem]">My Target {t}</p>
              </div>
              <ProgressComp
                value={donation?.amount_raised as number}
                max={donation?.target_amount}
              />
            </div>
            <div className="w-full flex flex-col gap-3 rounded-sm bg-gray-50 p-2">
              <p className="text-2xl capitalize font-semibold sm:text-[1rem]">
                {donation?.created_by}
              </p>
              <p className="text-[0.75rem]">{donation.description}</p>
              <p className="text-red-500 sm:text-[0.75rem] text-base">
                {"Ending in" +
                  " " +
                  format(new Date(donation.date).getTime(), "PPP")}
              </p>
            </div>
            <p className="sm:text-[0.75rem]">
              {donation?.donators.length +
                " " +
                "generous people have donated to this campaign"}
            </p>
            <div className="w-full flex flex-col gap-2 bg-gray-50 rounded-sm p-2">
              <p
                onClick={() => {
                  copyToClipboard("");
                  toast({
                    title: "Account Number Copied",
                  });
                }}
                className="cursor-pointer sm:text-[0.75rem]"
              >
                Account Number:{" "}
                <strong className="text-xl sm:text-[0.9rem] wordGradient font-semibold">
                  {donation?.donation_account.account_number}
                </strong>
              </p>
              <p className="sm:text-[0.75rem]">
                Account Name:
                <strong className="text-xl capitalize sm:text-[0.9rem] wordGradient font-semibold">
                  {donation?.donation_account.account_name}
                </strong>
              </p>
              <p className="sm:text-[0.75rem]">
                Bank Name:{" "}
                <strong className="text-xl sm:text-[0.9rem] wordGradient font-semibold">
                  {donation?.donation_account.bank_name}
                </strong>
              </p>
            </div>
            <div>
              <Button
                icon={<BiShare />}
                name="Share Campaign"
                disabled={false}
                varient="filled"
                onClick={share}
                className="w-full h-[2.5rem]"
                borderRadius
              />
            </div>
            <Link
              className="h-full flex sm:text-[0.75rem] text-base text-purple-700 items-center justify-end flex-col w-full text-center"
              href={"/"}
            >
              9JA WISE &copy;{new Date(Date.now()).getFullYear()}
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
