"use client";

//------------>All Imports<--------------
import { SheetClose } from "../ui/sheet";
import { MdArrowBackIosNew } from "react-icons/md";
import SheetComp from "../sheet";
import { useStore } from "@/provider";
import Input from "../input";
import { IoMdSend } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import Instructions from "./instructions";
import { AnimatePresence, motion } from "framer-motion";
import Response, { responseProps } from "./response";
import BotLoading from "./botLoading";
import { v4 as uuidv4 } from "uuid";
import BotError from "./botError";

//Types Used
type modeProps = {
  name: string;
  mode: "ASK-QUESTION" | "CUSTOMER-SERVICE" | "CREATE-ACCOUNT";
};
enum ChatBot_Constant {
  chat_bot_name = "BAGUE",
  chat_bot_status = "ONLINE",
  chat_bot_image = "https://i.ibb.co/bXkqZ45/peeps-avatar-6-1.png",
}
export type accountProps = {
  phoneNumber: null | number;
  email: null | string;
  otp: null | string | number;
  amNotARobot: string | null;
  password: null | string;
  confirmPassword: null | string;
  fullName: string;
  accountType: string;
};

//Motion Variants
const containerVariant = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.3, duration: 0.7 },
  },
};
const eachItemVariant = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 100 },
};

const modes: modeProps[] = [
  {
    name: "About 9jaWise",
    mode: "ASK-QUESTION",
  },
  {
    name: "Create Account",
    mode: "CREATE-ACCOUNT",
  },
  {
    name: "Customer Service",
    mode: "CUSTOMER-SERVICE",
  },
];

const ChatBot = ({
  button,
  mode,
}: {
  button: React.ReactNode;
  mode: "CUSTOMER-SERVICE" | "ASK-QUESTION" | "CREATE-ACCOUNT";
}) => {
  const {
    is_darkmode,
    conversation,
    updateConversation,
    addConversation,
    clearChat,
  } = useStore(); //Global Store from Zustand

  //------>Dirrent Type of Mode User can chhose<-------
  const [currentMode, setCurrentMode] = useState<
    "CUSTOMER-SERVICE" | "ASK-QUESTION" | "CREATE-ACCOUNT"
  >(mode);

  //------>Track the request and the response from the server<------
  const [state, setState] = useState<{
    loading: boolean;
    error: null | string;
  }>({
    loading: false,
    error: null,
  });

  //---------->Tracking when user is opening an account<----------
  const [account_process, setAccount_process] = useState<number>(0);
  const [accountCreationDetails, setAccountCreationDetails] =
    useState<accountProps>({
      phoneNumber: null,
      email: null,
      otp: null,
      amNotARobot: null,
      password: null,
      confirmPassword: null,
      fullName: "",
      accountType: "PERSONAL",
    });
  //------------>Chat Bot Inputs<-----------
  const [showModes, setShowModes] = useState(false);
  const [inputType, setInputType] = useState<"password" | "text">("text");
  const [userQuery, setUserQuery] = useState<number | string>("");

  //Refs used for scrolling and aborting request -->
  const abortRef = useRef<AbortController | null>(null);
  const scrollingRef = useRef<HTMLDivElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);

  //----->Base on if darkmode is toggle select background<-----
  const background = is_darkmode
    ? "headerBackground_dark"
    : "headerBackground_light";

  //A Async func to send request to the data base for processing
  const sendRequest = (
    e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e?.preventDefault();
    //If user did not enter an input return
    if (!userQuery) {
      return;
    }

    setUserQuery(""); //Clear request to avoid sending multiple request
    const user_request_toLowercase = String(userQuery).toLowerCase().trim();

    //Clear chat if user request to
    if (
      user_request_toLowercase === "clear" ||
      user_request_toLowercase === "reset"
    ) {
      setAccount_process(0);
      clearChat();
      return;
    }

    if (user_request_toLowercase === "modes") return setShowModes(true);
    setState({ ...state, loading: true });

    abortRef.current?.abort(); //Abort previous request if its not yet completed
    abortRef.current = new AbortController(); //Create a new controller signal

    const chat_id = uuidv4(); //Create unique chat Id

    //A user input to chat and start request
    addConversation({
      id: chat_id,
      user: userQuery as string,
      chatBot: null,
    });

    const payload = {
      mode: currentMode,
      message: userQuery as string,
    };

    switch (currentMode) {
      case "ASK-QUESTION":
        //Send request to the server
        fetch("/api/chat-bot", {
          method: "POST",
          body: JSON.stringify(payload),
          signal: abortRef.current?.signal,
        })
          .then(async (response) => {
            const res = await response.json();

            //Send this as payloads to zustannd state
            const props: responseProps = {
              reply: res[0]?.response,
              options: res[0]?.options,
            };

            if (response.ok) {
              updateConversation(chat_id, props);
              setState({ ...state, error: null });
            } else {
              setState({ ...state, error: response.statusText });
            }
          })
          .finally(() => setState({ ...state, loading: false }));
        break;
      case "CREATE-ACCOUNT":
        //Send request to the server
        fetch("/api/chat-bot", {
          method: "POST",
          body: JSON.stringify({
            message: userQuery,
            mode: currentMode,
            id: account_process,
            accountProps: {
              ...accountCreationDetails,
            },
          }),
          signal: abortRef.current?.signal,
        })
          .then(async (response) => {
            const res = await response.json();
            //Send this as payloads to the state-manager
            const props: responseProps = {
              reply: res[0]?.response,
              options: res[0]?.options,
            };

            //!Do not change
            if (res[0].amNotARobot) {
              setAccountCreationDetails({
                ...accountCreationDetails,
                amNotARobot: res[0].amNotARobot,
              });
            }

            setAccount_process(res[0].index);

            if (response.ok) {
              updateConversation(chat_id, props);
              setState({ ...state, error: null });
            } else {
              setState({ ...state, error: response.statusText });
            }
          })
          .finally(() => setState({ ...state, loading: false }));
        break;
      case "CUSTOMER-SERVICE":
        fetch("/api/chat-bot", {
          method: "POST",
          body: JSON.stringify({ message: userQuery, mode: currentMode }),
          headers: { "Content-Type": "application/json" },
          signal: abortRef.current?.signal,
        })
          .then(async (response) => {
            const res = await response.json();
            //Send this as payloads to zustannd state
            const props: responseProps = {
              reply: res[0]?.response,
              options: res[0]?.options,
            };

            if (response.ok) {
              updateConversation(chat_id, props);
              setState({ ...state, error: null });
            } else {
              setState({ ...state, error: response.statusText });
            }
          })
          .finally(() => setState({ ...state, loading: false }));
        break;
      default:
        break;
    }

    setShowModes(false);
  };

  //Using this to scroll to the bottom when the conversion changes when user input or chatbot response
  useEffect(() => {
    divRef.current?.scrollTo({
      behavior: "smooth",
      top: (scrollingRef.current?.clientHeight as number) + 100,
    });
  }, [conversation]);

  /**
   * A useEffect for keeping an eye on the change happening which userQuery which is the user Input
   */

  console.log(accountCreationDetails);

  useEffect(() => {
    setInputType("text");

    if (!userQuery) {
      return;
    }
    // Setting the properties using just one state (will be checking for the index)
    setAccountCreationDetails((prevDetails) => {
      switch (account_process) {
        case 3:
          return {
            ...prevDetails,
            email: userQuery as string,
            phoneNumber: userQuery as number,
          };
        case 4:
          return {
            ...prevDetails,
            fullName: userQuery as string,
          };
        case 5:
          return {
            ...prevDetails,
            fullName: userQuery as string,
          };
        case 7:
          setInputType("password");
          return {
            ...prevDetails,
            password: userQuery as string,
          };
        case 8:
          setInputType("password");
          return {
            ...prevDetails,
            confirmPassword: userQuery as string,
          };
        case 9:
          return {
            ...prevDetails,
            confirmAmNotARobot: userQuery as string,
          };
        case 10:
          return {
            ...prevDetails,
            accountType: userQuery as string,
          };
        default:
          return prevDetails;
      }
    });
  }, [userQuery]);

  return (
    <div className={`w-full`}>
      <SheetComp
        button={button}
        header={
          <header
            className={`w-full z-10 ${background} absolute top-0 left-0 p-3 border-b-[1.2px] border-solid border-gray-200 cursor-pointer justify-between flex items-center`}
          >
            <SheetClose>
              <MdArrowBackIosNew className="p-[2px]" size={15} />
            </SheetClose>
            <div className="flex flex-col items-center gap-1">
              <p className="text-xl">{ChatBot_Constant.chat_bot_name}</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-600" />
                <p className="dark:text-gray-300 text-[0.9rem] text-slate-700">
                  {ChatBot_Constant.chat_bot_status}
                </p>
              </div>
            </div>
            <img
              src={ChatBot_Constant.chat_bot_image}
              alt="avatar"
              className="w-[3rem] h-[3rem] rounded-full"
            />
          </header>
        }
      >
        <div ref={divRef} className="pt-24 overflow-auto pb-24 h-full w-full">
          {conversation.length === 0 ? <Instructions /> : <div />}
          {
            <div
              ref={scrollingRef}
              className={`w-full flex px-2 flex-col gap-3`}
            >
              {conversation.map((c, i) => (
                <div key={i}>
                  {c.user && (
                    <div className="w-full flex items-end justify-end">
                      <p className="w-fit text-white p-2 cursor-pointer bg-purple-300 rounded-t-xl rounded-bl-xl">
                        {c.user}
                      </p>
                    </div>
                  )}
                  {c.chatBot ? (
                    <div className="w-full mt-1 flex flex-col gap-2 items-start justify-start">
                      <Response
                        query={userQuery as string}
                        setQuery={setUserQuery}
                        reply={c.chatBot.reply}
                        options={c.chatBot.options}
                        chatBotImage={ChatBot_Constant.chat_bot_image}
                      />
                    </div>
                  ) : (
                    <BotLoading />
                  )}
                </div>
              ))}
            </div>
          }
          {/* Input Section */}
          <div className="absolute z-10 w-full left-0 bottom-0">
            {/* Modes */}
            {(conversation.length === 0 || showModes) && (
              <AnimatePresence>
                <motion.div
                  animate="visible"
                  initial="hidden"
                  exit="hidden"
                  variants={containerVariant}
                  className="w-full gap-2 px-2 pb-1 flex items-center justify-between"
                >
                  {modes.map((m, i) => (
                    <motion.button
                      variants={eachItemVariant}
                      //@ts-ignore
                      onClick={() => setCurrentMode(m.mode)}
                      className={`w-full ${
                        m.mode === currentMode
                          ? "bg-purple-700 text-white"
                          : "bg-purple-100 text-purple-700"
                      } p-2 rounded-md w-full sm:h-[4rem] md:h-[4rem] hover:bg-purple-700 hover:text-white`}
                      key={i}
                    >
                      {m.name}
                    </motion.button>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
            <BotError error={state.error} />
            <form
              onSubmit={sendRequest}
              className={`w-full ${background} p-2 md:px-2 sm:px-2 sm:py-3 md:py-3 flex gap-1 items-center `}
            >
              <Input
                value={userQuery}
                setValue={setUserQuery}
                type={inputType}
                error={false}
                disabled={false}
                className="w-full"
                placeholder="Bague ready to answer your questions"
              />
              <button
                disabled={state.loading}
                onClick={sendRequest}
                className="p-3 disabled:bg-purple-500 disabled:cursor-pointer rounded-md bg-purple-700 text-white"
              >
                <IoMdSend size={15} />
              </button>
            </form>
          </div>
        </div>
      </SheetComp>
    </div>
  );
};

export default ChatBot;
