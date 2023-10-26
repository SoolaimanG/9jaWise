"use client";

import { SiChatbot } from "react-icons/si";
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
import { useGetId } from "@/Hooks/useGetId";

type modeProps = {
  name: string;
  mode: "ASK-QUESTION" | "CUSTOMER-SERVICE" | "CREATE-ACCOUNT";
};

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

const ChatBot = () => {
  const chatBotAvatar = "https://i.ibb.co/bXkqZ45/peeps-avatar-6-1.png";
  const pathname = useGetId(1);
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

  const [currentMode, setCurrentMode] = useState<
    "CUSTOMER-SERVICE" | "ASK-QUESTION" | "CREATE-ACCOUNT"
  >("ASK-QUESTION");
  const {
    is_darkmode,
    conversation,
    updateConversation,
    addConversation,
    clearChat,
  } = useStore();
  const [userQuery, setUserQuery] = useState<number | string>("");
  const [state, setState] = useState<{
    loading: boolean;
    error: "not-found" | "server error" | "innappropriate message" | null;
  }>({
    loading: false,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);
  const scrollingRef = useRef<HTMLDivElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const [showModes, setShowModes] = useState(false);
  const [inputType, setInputType] = useState<"password" | "text">("text");

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
  const [accountSteps, setAccountSteps] = useState<number>(0);

  const background = is_darkmode
    ? "headerBackground_dark"
    : "headerBackground_light";

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

  const sendRequest = () => {
    if (!userQuery) {
      return;
    }

    const toLowerCase = (userQuery as string).toLowerCase();
    setUserQuery("");

    //Clear chat if user request to
    if (toLowerCase === "clear" || toLowerCase === "reset") {
      setAccountSteps(0);
      clearChat();
      return;
    }

    if (toLowerCase === "modes") {
      return setShowModes(true);
    }

    setState({ ...state, loading: true });
    abortRef.current?.abort();

    abortRef.current = new AbortController();

    const ID = Date.now();

    addConversation({
      id: ID,
      user: userQuery as string,
      chatBot: null,
    });

    switch (currentMode) {
      case "ASK-QUESTION":
        //Send request to the server
        fetch("/api/chat-bot", {
          method: "POST",
          body: JSON.stringify({ message: userQuery, mode: currentMode }),
          headers: { "Content-Type": "application/json" },
          signal: abortRef.current?.signal,
        })
          .then(async (response) => {
            const res = await response.json();
            console.log(res);
            //Send this as payloads to zustannd state
            const props: responseProps = {
              reply: res[0]?.response,
              options: res[0]?.options,
            };

            if (response.ok) {
              updateConversation(ID, props);
              setState({ ...state, error: null });
            } else {
              const errorCodes = {
                404: "not-found",
                500: "server error",
                403: "innappropriate message",
              };

              if (
                response.status === 404 ||
                response.status === 403 ||
                response.status === 500
              ) {
                //@ts-ignore
                setState({ ...state, error: errorCodes[response.status] });
              }
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
            id: accountSteps,
            accountProps: {
              ...accountCreationDetails,
            },
          }),
          headers: { "Content-Type": "application/json" },
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

            setAccountSteps(res[0].index);

            if (response.ok) {
              updateConversation(ID, props);
              setState({ ...state, error: null });
            } else {
              updateConversation(ID, props);
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
              updateConversation(ID, props);
              setState({ ...state, error: null });
            } else {
              const errorCodes = {
                404: "not-found",
                500: "server error",
                403: "innappropriate message",
              };

              if (
                response.status === 404 ||
                response.status === 403 ||
                response.status === 500
              ) {
                //@ts-ignore
                setState({ ...state, error: errorCodes[response.status] });
              }
            }
          })
          .finally(() => setState({ ...state, loading: false }));
        break;

      default:
        break;
    }

    setShowModes(false);
  };

  useEffect(() => {
    //Scroll to bottom
    divRef.current?.scrollTo({
      behavior: "smooth",
      top: (scrollingRef.current?.clientHeight as number) + 100,
    });
  }, [conversation]);

  useEffect(() => {
    setInputType("text");

    if (!userQuery) {
      return;
    }
    // Setting the properties using just one state (will be checking for the index)
    setAccountCreationDetails((prevDetails) => {
      switch (accountSteps) {
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
            otp: userQuery as string,
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
    pathname !== "account" && (
      <div className={`fixed z-30 bottom-3 right-3`}>
        <SheetComp
          button={
            <span className="w-14 h-14 cursor-pointer rounded-full text-white bg-purple-600 flex items-center justify-center shadow-lg">
              <SiChatbot size={25} />
            </span>
          }
          header={
            <header
              className={`w-full z-10 ${background} absolute top-0 left-0 p-3 border-b-[1.2px] border-solid border-gray-200 cursor-pointer justify-between flex items-center`}
            >
              <SheetClose>
                <MdArrowBackIosNew className="p-[2px]" size={15} />
              </SheetClose>
              <div className="flex flex-col items-center gap-1">
                <p className="text-xl">Bague</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                  <p className="dark:text-gray-300 text-[0.9rem] text-slate-700">
                    Online
                  </p>
                </div>
              </div>
              <img
                src={chatBotAvatar}
                alt="avatar"
                className="w-[3rem] h-[3rem] rounded-full"
              />
            </header>
          }
          children={
            <div
              ref={divRef}
              className="pt-24 overflow-auto pb-24 h-full w-full"
            >
              {/* INSTRUCTIONS */}
              {conversation.length === 0 && <Instructions />}
              {/* User query */}
              {
                <div
                  ref={scrollingRef}
                  className={`w-full flex px-2 flex-col gap-3`}
                >
                  {conversation.map((c, i) => (
                    <div key={i}>
                      {c.user && (
                        <div className="w-full flex items-end justify-end">
                          <p className="w-fit p-2 cursor-pointer text-purple-800 bg-purple-300 rounded-t-md rounded-bl-md">
                            {c.user}
                          </p>
                        </div>
                      )}
                      {c.chatBot ? (
                        <div className="w-full mt-1 flex flex-col gap-2 items-start justify-start">
                          <Response
                            query={userQuery as string}
                            setQuery={setUserQuery}
                            funcCall={sendRequest}
                            reply={c.chatBot.reply}
                            options={c.chatBot.options}
                            chatBotImage={chatBotAvatar}
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
                          } p-2 rounded-md hover:bg-purple-700 hover:text-white`}
                          key={i}
                        >
                          {m.name}
                        </motion.button>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}
                {state.error && (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: -40 }}
                    className="flex w-fit border text-red-500 border-red-700 items-center p-1 rounded-md glassmorph justify-center"
                  >
                    Something went wrong {state.error}
                  </motion.div>
                )}
                <div
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
                </div>
              </div>
            </div>
          }
        />
      </div>
    )
  );
};

export default ChatBot;
