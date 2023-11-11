"use client";

import React from "react";
import ChatBot from "./chatBot";
import { SiChatbot } from "react-icons/si";
import { useGetId } from "@/Hooks/useGetId";

const LayOutShow = () => {
  const path = useGetId(1);

  return (
    path.toLowerCase() !== "account" && (
      <div className="fixed z-30 bottom-3 right-3">
        <ChatBot
          mode="ASK-QUESTION"
          button={
            <span className="w-14 h-14 cursor-pointer rounded-full text-white bg-purple-600 flex items-center justify-center shadow-lg">
              <SiChatbot size={25} />
            </span>
          }
        />
      </div>
    )
  );
};

export default LayOutShow;
