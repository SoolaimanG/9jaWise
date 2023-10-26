"use client";

import { useFetchData } from "@/Hooks/useFetchData";
import { useIdle } from "@/Hooks/useIdle";
import { beneficiariesProps, userProps } from "@/Models/user";
import { Modal } from "@/components/modal";
import { AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useStore } from "@/provider";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export default function Provider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}): React.ReactNode {
  const idle = useIdle(30000);
  const { setUser, user, refresh_count } = useStore();

  useEffect(() => {
    const getUser = async () => {
      const res = await fetch("/api/GETS/user");

      if (!res.ok) {
        //
        return;
      }

      const { data }: { data: userProps<beneficiariesProps> } =
        await res.json();

      setUser(data);
    };

    getUser();
  }, [refresh_count]);

  return (
    <SessionProvider session={session}>
      <Modal
        open={idle}
        button={<></>}
        content={
          <div className="w-full">
            <AlertDialogTitle className="text-center">
              Hey! Are you there?
            </AlertDialogTitle>
          </div>
        }
        actionBtn="Logout"
      />
      {children}
    </SessionProvider>
  );
}
