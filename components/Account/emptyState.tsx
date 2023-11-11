import React from "react";

const EmptyState = ({ message }: { message: string }) => {
  return (
    <div className="w-full h-full gap-2 flex items-center justify-center">
      <div className="h-[1.5px] rounded-sm w-10 bg-slate-600 dark:bg-gray-200" />
      {message}
      <div className="h-[1.5px] rounded-sm w-10 bg-slate-600 dark:bg-gray-200" />
    </div>
  );
};

export default EmptyState;
