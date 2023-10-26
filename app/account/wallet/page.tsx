import Donation from "@/components/Account/donation";
import RequestPayment from "@/components/Account/requestPayment";
import React from "react";

const Page = () => {
  return (
    <div className="w-full flex flex-col gap-3">
      <Donation />
      <RequestPayment />
    </div>
  );
};

export default Page;
