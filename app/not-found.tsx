"use client";

import FadeIn from "@/components/Animations/fadeIn";
import Input from "@/components/input";
import { ExternalLink, Key, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

//import SlideIn from "@/components/Animations/slideIn";
//import Button from "@/components/button";

type page_props = {
  id: number;
  name: string;
  about_page: string;
  path: string;
  is_protected: boolean;
};

const pages_available: page_props[] = [
  {
    id: 1,
    name: "Landing Page",
    about_page:
      "Explore the features and benefits of our financial platform on the landing page. Learn how we can help you manage your finances with ease.",
    path: "/",
    is_protected: false,
  },
  {
    id: 2,
    name: "Sign In",
    about_page:
      "Sign in to your account to access your personalized dashboard. Manage your transactions, view account details, and stay in control of your finances.",
    path: "/auth/signin",
    is_protected: false,
  },
  {
    id: 3,
    name: "Sign Up",
    about_page:
      "Create a new account to experience seamless financial management. Sign up now and unlock a world of features to enhance your banking experience.",
    path: "/auth/signup",
    is_protected: false,
  },
  {
    id: 4,
    name: "Forget Password",
    about_page:
      "Forgot your password? No worries. Follow the steps to reset your password and regain access to your account securely.",
    path: "/auth/forget-password",
    is_protected: false,
  },
  {
    id: 5,
    name: "Confirm Email",
    about_page:
      "Verify your email address to secure your account and enable additional features. Confirming your email enhances the security of your account.",
    path: "/auth/verify-email",
    is_protected: false,
  },
  {
    id: 6,
    name: "Recovery Account",
    about_page:
      "Facing issues with your account? Use the account recovery process to regain access and troubleshoot any problems you may encounter.",
    path: "/auth/account-recovery",
    is_protected: false,
  },
  {
    id: 7,
    name: "Change Password",
    about_page:
      "Change your account password to enhance security. Keep your financial information safe by regularly updating your password.",
    path: "/auth/change-password",
    is_protected: false,
  },
  {
    id: 8,
    name: "Donation",
    about_page:
      "Make a meaningful contribution to our cause. Donate now and support initiatives that make a positive impact on the community.",
    path: "/donate/unique-id",
    is_protected: false,
  },
  {
    id: 9,
    name: "Know Your Customer (KYC)",
    about_page:
      "Complete the KYC process to ensure the security and compliance of your financial transactions. KYC helps in preventing fraudulent activities.",
    path: "/KYC/personal-details",
    is_protected: true,
  },
  {
    id: 10,
    name: "Home",
    about_page:
      "Welcome to your personalized home dashboard. View your account summary, latest activities, and important alerts at a glance.",
    path: "/account/home",
    is_protected: true,
  },
  {
    id: 11,
    name: "Records",
    about_page:
      "Access and manage your financial records effortlessly. Stay organized with our record-keeping features, making it easy to track your financial history.",
    path: "/account/records",
    is_protected: true,
  },
  {
    id: 12,
    name: "Wallet",
    about_page:
      "Explore your digital wallet and manage your funds securely. Track your transactions, check balances, and enjoy the convenience of a digital wallet.",
    path: "/account/wallet",
    is_protected: true,
  },
  {
    id: 13,
    name: "Settings",
    about_page:
      "Customize your account settings to tailor your financial management experience. Adjust preferences, security settings, and notification preferences.",
    path: "/account/settings",
    is_protected: true,
  },
  {
    id: 14,
    name: "Two Factor Authentication",
    about_page:
      "Enable an additional layer of security for your account with Two Factor Authentication (2FA). Customize your account settings to enhance the security of your financial information. Adjust preferences, security settings, and notification preferences for a personalized and secure experience.",
    path: "/auth/2fa",
    is_protected: false,
  },
];

const NotFound = () => {
  const [search, setSearch] = useState<string | number>("");
  const [results, setResults] = useState<page_props[]>([]);

  useEffect(() => {
    setResults(
      pages_available.filter((page) => {
        return (
          page.about_page
            .trim()
            .toLowerCase()
            .includes(String(search).toLowerCase().trim()) ||
          page.name.trim().toLowerCase().includes(String(search))
        );
      })
    );
  }, [search]);

  return (
    <div className="w-full overflow-hidden h-screen flex md:flex-col-reverse sm:flex-col-reverse">
      <div className="w-[40%] py-3 overflow-auto p-2 mt-5 flex h-full flex-col gap-3 md:w-full sm:w-full">
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-semibold md:text-xl sm:text-xl wordGradient">
            {"It's looks like you are lost!!!"}
          </p>
          <span className="text-base">
            {"Don't worry we will help you navigate to where you wanna go"}
          </span>
        </div>
        <div>
          <Input
            value={search}
            setValue={setSearch}
            type="text"
            placeholder="Search for a page"
          />
          <p className="text-base text-purple-500">
            Result {results.length} match
          </p>
        </div>
        <div className="w-full flex flex-col gap-2">
          {results.map((page) => (
            <FadeIn
              key={page.id}
              className="w-full cursor-pointer p-2 rounded-sm bg-gray-100 dark:bg-slate-400"
            >
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <p className="text-purple-600 text-2xl">{page.name}</p>
                  {page.is_protected && <Key rotate={-180} size={15} />}
                </div>
                <Link
                  className="p-1 bg-gray-200 dark:bg-slate-600 hover:dark:bg-slate-300 hover:dark:text-black hover:text-white hover:bg-gray-400 transition-all ease-linear delay-75 rounded-md"
                  href={page.path}
                >
                  <ExternalLink size={17} />
                </Link>
              </div>
              <p>{page.about_page}</p>
            </FadeIn>
          ))}
        </div>
      </div>
      {/* The Large Screen Layout > */}
      <div className="w-[60%] h-full md:h-[30%] sm:h-[30%] items-center justify-start md:justify-center sm:justify-center p-2 flex md:w-full gradient-one sm:w-full">
        <p className="liner text-white text-6xl md:text-center md:text-3xl sm:text-xl sm:text-center">
          404 PAGE
        </p>
      </div>
    </div>
  );
};

export default NotFound;
