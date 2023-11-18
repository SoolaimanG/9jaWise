import React, { useState } from "react";
import Button from "../button";
import { DialogAlert } from "../dialogAlert";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import { DialogDescription } from "../ui/dialog";
import { toast } from "../ui/use-toast";
import { useStore } from "@/provider";

const Donation_delete = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState(false); //Track request

  const { try_refresh } = useStore(); //Perform hard request

  //Delete the campaign using the ID
  const delete_campaign = async () => {
    setLoading(true);

    //Payload needed to perform the delete operation
    const payload = {
      id: id,
    };

    //Sending request to http://localhost:8080/api/donation/delete to delete donation
    const res = await fetch("/api/donation/delete", {
      method: "DELETE",
      body: JSON.stringify(payload),
    });

    //The response was !OK
    if (!res.ok) {
      setLoading(false);
      toast({
        title: `ERROR ${res.status}`,
        description: res.statusText,
        variant: "destructive",
      });
      return;
    }

    //Notify user and stop loading
    setLoading(false);
    toast({
      title: "SUCCESS",
      description: res.statusText,
    });
    try_refresh(); //Perform hard request
  };

  return (
    <DialogAlert
      button={
        <Button
          className="w-full h-[2.5rem]"
          name="Delete"
          disabled={false}
          onClick={() => {}}
          varient="danger"
          borderRadius
        />
      }
      content={
        <div className="w-full">
          <DialogTitle className="text-center text-base">
            Are you sure you want to delete this campaign?
          </DialogTitle>
          <div className="mt-2 flex flex-col gap-1">
            <p className="text-[1.2rem] text-red-500">Things to note:</p>
            <DialogDescription>
              After deletion link will no longer be visible to people
            </DialogDescription>
            <DialogDescription>
              If money is available in the campaign it will be move to your
              balance
            </DialogDescription>
            <DialogDescription>This action cannot be undone</DialogDescription>
          </div>
          <div className="flex mt-3 w-full items-center gap-2">
            <DialogClose className="w-full rounded-md hover:bg-gray-50 border border-slate-500 dark:border-slate-300 h-[2.5rem]">
              Cancel
            </DialogClose>
            <Button
              className="w-full h-[2.5rem]"
              states={loading ? "loading" : undefined}
              name="Delete"
              varient="danger"
              onClick={() => delete_campaign()}
              borderRadius
              disabled={loading}
            />
          </div>
        </div>
      }
    />
  );
};

export default Donation_delete;
