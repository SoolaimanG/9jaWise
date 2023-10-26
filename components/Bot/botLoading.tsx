import React from "react";

const BotLoading = () => {
  return (
    <div className="flex items-center gap-1">
      <div className="w-1 h-1 bg-gray-300 rounded-full loader_one" />
      <div className="w-1 h-1 bg-gray-300 rounded-full loader_two" />
      <div className="w-1 h-1 bg-gray-300 rounded-full loader_three" />
    </div>
  );
};

export default BotLoading;
