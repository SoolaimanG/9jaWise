import Accessibility from "@/components/Account/accessibility";
import AccountNavBar from "@/components/Navbars/accountNavBar";
import Sidebar from "@/components/Navbars/sidebar";
import Provider from "@/Functions/TSX/sessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);
  return (
    <Provider session={session}>
      <div className="w-screen bg-gray-200 dark:bg-slate-800 h-screen">
        <Sidebar />
        <div className="pl-[23%] overflow-hidden md:pl-0 sm:pl-0 md:pb-[5rem] sm:pb-[5rem] md:gap-2 sm:gap-2 w-full h-full flex">
          <div className="w-[40%] md:hidden bg-gray-100 dark:bg-slate-900 sm:w-hidden">
            <Accessibility />
          </div>
          <div className="w-[60%] overflow-auto md:w-full p-2 sm:w-full">
            <AccountNavBar />
            {children}
          </div>
        </div>
      </div>
    </Provider>
  );
};

export default Layout;
