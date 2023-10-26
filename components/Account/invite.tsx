import React, { useState } from "react";
import { SheetDescription } from "../ui/sheet";
import Input from "../input";
import TextArea from "../textArea";
import Button from "../button";
import { Clipboard } from "lucide-react";
import useClipboard from "@/Hooks/useClipboard";
import { useCheck } from "@/Hooks/useCheck";

const Invite = () => {
  const URL = "https://9jawise.com";

  const [email, setEmail] = useState<string | number>("");
  const [message, setMessage] = useState("");

  const { isCopied, copyToClipboard } = useClipboard();
  const checkEmail = useCheck(email as string, "email");

  const [states, setStates] = useState({
    email_sent: false,
    sending_error: false,
    error_message: "",
    email_sending: false,
  });

  //Destructing to understand better
  const { email_sending, email_sent, error_message, sending_error } = states;

  return (
    <div className="w-full flex flex-col gap-3">
      <SheetDescription className="text-center wordGradient text-xl">
        Thank you for wanting to invite someone!!
      </SheetDescription>
      <Input
        placeholder="Your Friend's Email"
        value={email}
        setValue={setEmail}
        type="text"
      />
      <TextArea
        placeholder="Write a message to your frind (OPTIONAL)"
        value={message}
        setValue={setMessage}
        height={10}
        resize={false}
      />
      <Button
        className="h-[2.45rem] w-full rounded-md"
        name="Send Email"
        states={
          email_sending
            ? "loading"
            : sending_error
            ? "failed"
            : email_sent
            ? "complete"
            : undefined
        }
        varient="warning"
        disabled={checkEmail ? false : true}
        onClick={() => {}}
      />
      {sending_error && (
        <span className="text-red-500 text-[0.9rem]">{error_message}</span>
      )}
      <p className="text-center text-gray-300 text-2xl">OR</p>
      <div className="w-full flex items-center gap-2">
        <Input
          className="w-[90%]"
          disabled={true}
          placeholder="9JA WISE URL"
          value={URL}
          setValue={() => {}}
          type="text"
        />
        <Button
          className="h-[2.45rem] w-[10%] rounded-md"
          icon={<Clipboard size={20} />}
          name=""
          varient={isCopied ? "filled" : "outlined"}
          disabled={false}
          onClick={() => copyToClipboard(URL)}
        />
      </div>
    </div>
  );
};

export default Invite;
