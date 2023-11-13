import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import type { Metadata } from "next";
import LayOutShow from "@/components/Bot/layOutShow";
import DarkModeComponent from "@/Functions/TSX/darkMode_Comp";

export const metadata: Metadata = {
  title: "9JA WISE",
  description: "A web banking application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={` dark:bg-blacks-500 dark:text-gray-200`}>
        <DarkModeComponent>
          {children}
          <Toaster />
          <LayOutShow />
        </DarkModeComponent>
      </body>
    </html>
  );
}
