import { useState } from "react";
import { AiOutlineClose, AiTwotoneStar } from "react-icons/ai";
import TextArea from "./textArea";
import { Checkbox } from "./ui/checkbox";
import Button from "./button";

export type feedbackProps = {
  email: string;
  handleCloseFunc: () => void;
  handleSendFunc: () => void;
};

const Feedback = (props: feedbackProps) => {
  const { email, handleCloseFunc, handleSendFunc } = props;
  const [starPosition, setStarPosition] = useState(0);
  const [message, setMessage] = useState("");
  const [followUp, setFollowUp] = useState(true);

  const handleStarCheck = (i: number) => {
    setStarPosition(i);
  };

  const handleClose = () => {};

  //using EMAILJS to recieve email directly in my inbox
  const handleSend = () => {};

  return (
    <div className="w-[20rem] h-fit rounded-md px-5 py-2 bg-gray-100 dark:bg-slate-700 dark:text-gray-200 relative">
      <span
        onClick={handleClose}
        className="absolute cursor-pointer top-0 right-0 p-1 rounded-full bg-gray-200 dark:bg-slate-800 text-black dark:text-white mt-1 mr-1"
      >
        <AiOutlineClose size={20} />
      </span>
      <div className="w-full mt-5 flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Give feedback</h2>
          <p className="text-[0.9rem]">What do you think of this 9jaWise</p>
        </div>
        <div className="flex gap-5 cursor-pointer items-center">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              onClick={() => handleStarCheck(i + 1)}
              className={`${
                i + 1 <= starPosition ? "text-purple-600" : "text-gray-200"
              } `}
            >
              <AiTwotoneStar size={25} />
            </div>
          ))}
        </div>
        <form action="">
          <label className="text-[0.9rem]" htmlFor="text">
            Do you have any thought to share?
          </label>
          <TextArea
            height={5}
            resize={false}
            value={message}
            setValue={setMessage}
          />
        </form>
        <div className="flex flex-col gap-1">
          <p>Can we follow you up on your feedback?</p>
          <div className="w-full flex gap-2">
            <div className="flex gap-1 items-center">
              <Checkbox
                checked={followUp}
                onCheckedChange={() => {
                  setFollowUp(true);
                }}
              />
              <span>Yes</span>
            </div>
            <div className="flex gap-1 items-center">
              <Checkbox
                checked={!followUp}
                onCheckedChange={() => {
                  setFollowUp(false);
                }}
              />
              <span>No</span>
            </div>
          </div>
        </div>
        <div className="w-full mt-3 flex items-center gap-1">
          <Button
            borderRadius={true}
            varient="filled"
            name="Send"
            disabled={false}
            onClick={() => {}}
          />
          <Button
            borderRadius={true}
            varient="outlined"
            name="Cancel"
            disabled={false}
            onClick={handleClose}
          />
        </div>
      </div>
    </div>
  );
};

export default Feedback;
