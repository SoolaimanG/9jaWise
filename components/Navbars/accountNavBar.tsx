"use client";

import { notificationsProps } from "@/Models/user";
import React, { useState } from "react";
import { PiBell } from "react-icons/pi";
import SlideFromAbove from "../Animations/slideFromAbove";
import { useStore } from "@/provider";
import Link from "next/link";
import { useCurrentTimeZone } from "@/Hooks/useCurrentTime";
import Notification from "../Account/notification";
import SheetComp from "../sheet";
import { SheetClose } from "../ui/sheet";
import { BsArrowLeft } from "react-icons/bs";
import { useGetId } from "@/Hooks/useGetId";

const AccountNavBar = () => {
  const time = useCurrentTimeZone();
  const { is_darkmode, user } = useStore();
  const path = useGetId(2);

  return (
    <SlideFromAbove className="w-full sticky z-30 top-0 left-0 flex items-center justify-between">
      <div
        className={`w-[70%] md:w-[20rem] sm:w-[85%] h-fit cursor-pointer justify-between flex items-center px-3 py-1 rounded-full ${
          is_darkmode ? "glassmorph_darkmode" : "navGlassmorphism"
        }`}
      >
        {path === "home" ? (
          <p className="text-gray-500 sm:text-[0.79rem] dark:text-gray-300">
            {`Good ${time},`}{" "}
            <span className="text-[1.2rem] sm:text-[0.8rem] font-semibold text-purple-500">
              {user?.username || user?.fullName.split(" ")[0] + "!"}
            </span>
          </p>
        ) : (
          <p className="text-xl sm:text-[1rem] font-semibold text-purple-500">
            {path.toUpperCase()}
          </p>
        )}
        <Link href={"/"} passHref>
          <img
            src={user?.profileImage}
            alt="image"
            className="w-[2rem] sm:w-[1.7rem] sm:h-[1.7rem] h-[2rem] rounded-full"
          />
        </Link>
      </div>

      <SheetComp
        button={
          <span
            className={`text-xl relative p-2 rounded-2xl cursor-pointer ${
              is_darkmode ? "glassmorph_darkmode" : "navGlassmorphism"
            } text-purple-500 dark:text-white`}
          >
            {(user?.notifications?.length as number) > 0 && (
              <div className="w-2 h-2 absolute top-0 right-0 rounded-full bg-purple-900 animate-pulse" />
            )}

            <PiBell />
          </span>
        }
        header={
          <div
            className={`flex p-2 ${
              is_darkmode ? "glassmorph_darkmode" : "navGlassmorphism"
            } fixed items-center z-30 gap-2 w-full`}
          >
            <SheetClose className="text-gray-500 dark:text-gray-300">
              <BsArrowLeft size={20} />
            </SheetClose>
            <p className="text-2xl text-purple-500 font-semibold">
              Notification
            </p>
          </div>
        }
      >
        <div className="pt-14 h-full">
          <Notification />
        </div>
      </SheetComp>
    </SlideFromAbove>
  );
};

export default AccountNavBar;
