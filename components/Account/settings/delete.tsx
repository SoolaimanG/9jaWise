//--------------->All Imports<----------------
import Button from "@/components/button";
import { toast } from "@/components/ui/use-toast";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DialogAlert } from "@/components/dialogAlert";
import { DialogClose } from "@radix-ui/react-dialog";
import { DialogFooter } from "@/components/ui/dialog";

const Delete = () => {
  const [loading, setLoading] = useState(false); //Track request states
  const router = useRouter(); //useRouter from NEXTJS to push to signup page after deletion
  const abortRef = useRef<AbortController | null>(null); //UseREF for abort the request in case the use has change of mind in process

  //Function to abort request sent ->
  const abort_request = () => {
    abortRef.current = null;
  };

  //Asynchronous function use to delete account
  const delete_account = async () => {
    setLoading(true); //Start loading

    //send request to api http:localhost:8080/api/settings/delete
    const res = await fetch("/api/settings/delete", {
      method: "DELETE",
      signal: abortRef.current?.signal,
    });

    //if the res !OK notify the user
    if (!res.ok) {
      setLoading(false);
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText,
        variant: "destructive",
      });
      return;
    }

    //when the operation is successful route to http:localhost:8080/auth/signup, in case the user wants to create a new account
    setLoading(false);
    toast({
      title: `SUCCESS`,
      description: res.statusText,
    });
    router.push("/auth/signup"); //route to signUp
  };

  return (
    <DialogAlert
      button={
        <Button
          name="Delete account"
          disabled={loading}
          varient="danger"
          onClick={() => {}}
          className="w-full h-[2.5rem]"
        />
      }
      title="Account Deletion"
      description="Are you sure you want to continue with decisions?"
      content={
        <div className="w-full flex flex-col gap-3">
          <p className="text-red-500 text-center text-lg">
            Here are things to note before deleting your account
          </p>
          <ul className="flex flex-col gap-2">
            <li className="dark:text-red-300 text-red-400">
              This action is irrevesible
            </li>
            <li className="dark:text-red-300 text-red-400">
              All your data will be lost including your funds
            </li>
          </ul>
          <DialogFooter className="w-full flex items-center gap-2">
            <DialogClose
              onClick={abort_request}
              className="w-full h-[2.5rem] rounded-md border border-gray-500 dark:border-gray-400"
            >
              Cancel
            </DialogClose>
            <Button
              name="Proceed to delete"
              borderRadius
              disabled={loading}
              varient="danger"
              states={loading ? "loading" : undefined}
              onClick={delete_account}
              className="w-full h-[2.5rem]"
            />
          </DialogFooter>
        </div>
      }
    />
  );
};

export default Delete;
