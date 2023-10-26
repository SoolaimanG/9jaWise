import AuthBackground from "@/components/AuthComp/authBackground";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-screen overflow-hidden flex md:flex-col-reverse sm:flex-col-reverse">
      <div className="basis-[40%] md:basis-[80%] sm:basis-[80%] w-full flex">
        {children}
      </div>
      <div className="basis-[60%] md:basis-[20%] sm:basis-[20%] w-full flex">
        <AuthBackground />
      </div>
    </div>
  );
};

export default Layout;
