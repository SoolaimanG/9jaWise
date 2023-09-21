import { varientTypes } from "./chip";
import { VscError } from "react-icons/vsc";
import {
  BsFillExclamationCircleFill,
  BsFillCheckCircleFill,
} from "react-icons/bs";

type notificationsProps = {
  type: "message" | varientTypes | "success";
  message: string | React.ReactNode;
  button?: React.ReactNode;
  btn_position?: "right" | "down";
};

const Notifications = (props: notificationsProps) => {
  const { type, message, button, btn_position } = props;
  const colors = {
    message: [
      "bg-purple-200 text-purple-500 border-purple-700",
      <BsFillExclamationCircleFill key={1} />,
    ],
    warning: [
      "bg-yellow-100 text-yellow-500 border-yellow-700",
      <BsFillExclamationCircleFill key={2} />,
    ],
    error: ["bg-red-100 text-red-500 border-red-700", <VscError key={3} />],
    success: [
      "bg-green-100 text-green-500 border-green-700",
      <BsFillCheckCircleFill key={4} />,
    ],
  };

  return (
    <div
      className={`py-2 px-1 ${colors[type][0]} border-solid border-l-4 rounded-r-md w-full flex gap-1`}
    >
      <span className={`${colors[type][0]} m-[3px]`}>{colors[type][1]}</span>
      <div
        className={`flex ${
          btn_position === "right"
            ? "flex-row w-full items-center justify-between"
            : "flex-col gap-1 items-start justify-start"
        } `}
      >
        {typeof message === "string" ? <p>{message}</p> : <div>{message}</div>}
        {button}
      </div>
    </div>
  );
};

export default Notifications;
