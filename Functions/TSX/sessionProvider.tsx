"use client";

//-------------->All Imports<--------------
import { useIdle } from "@/Hooks/useIdle";
import { beneficiariesProps, userProps } from "@/Models/user";
import { Modal } from "@/components/modal";
import { AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { useStore } from "@/provider";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Provider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}): React.ReactNode {
  const isIdle = useIdle(120000); //A custom hook for detect =ing when a page is idle or not --->True or False
  const { setUser, refresh_count } = useStore(); //Zustand states to get some methods to set user
  const router = useRouter();

  //---------->States Here<----------
  const [am_active, setAm_active] = useState(false);
  const [time, setTime] = useState(120);

  const logout_user = () => {
    signOut({
      redirect: false,
    }).then(() => {
      router.push("/auth/signin");
    });
  };

  ///Fetching the current user from the DB
  useEffect(() => {
    const getUser = async () => {
      const res = await fetch("/api/GETS/user", {
        next: { revalidate: 5 },
      });

      if (!res.ok) {
        toast({
          title: `ERROR ${res.status}`,
          description: res.statusText,
          variant: "destructive",
        });
        return;
      }

      const { data }: { data: userProps<beneficiariesProps> } =
        await res.json();

      setUser(data);
    };

    getUser();
  }, [refresh_count]);

  //Please run when isIdle changes from either True to False or False to True any
  useEffect(() => {
    if (!isIdle && !am_active) return;

    setAm_active(true);

    const timer = setInterval(() => {
      setTime((prevTime) => {
        const newTime = prevTime - 1;

        if (newTime === 0) {
          clearInterval(timer);
          logout_user();
          setUser(null); //Setting the user to null
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIdle]);

  //this is to be show when user is IDLE
  const idle_modal = (
    <Modal
      open={am_active}
      button={<></>}
      content={
        <div className="w-full">
          <AlertDialogTitle className="text-center">
            Hey! Are you there?
          </AlertDialogTitle>
          <AlertDialogDescription className="w-full text-purple-600 text-center">
            Checking if you are active or you left your page unattended
          </AlertDialogDescription>
          <div className="w-full flex mt-4 flex-col gap-2">
            <li className="w-full text-left">
              <strong>Security First:</strong> Your safety is our top priority.
              We're conducting routine security checks to ensure the protection
              of your account.
            </li>

            <li className="w-full text-left">
              <strong>Confirm Your Presence:</strong> Please click or interact
              with the page to confirm that you're actively using the
              application. This simple action helps us maintain a secure
              environment.
            </li>

            <li className="w-full text-left">
              <strong>Note for Your Safety:</strong> Regular check-ins
              contribute to safeguarding your account from unauthorized access.
              Thank you for your cooperation in keeping your account secure.
            </li>
            <p className="text-center text-xl md:text-[1rem] w-full text-red-600">
              Loging out in {time}secs
            </p>
          </div>
        </div>
      }
      actionBtn="Am Active"
      action={() => {
        setAm_active(false);
        setTime(120);
      }}
    />
  );

  return (
    <SessionProvider session={session}>
      {/* This is a model to be display if the user is online or ~online */}
      {idle_modal}
      {children}
    </SessionProvider>
  );
}
