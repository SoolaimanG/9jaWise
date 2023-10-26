"use client";

import FadeIn from "@/components/Animations/fadeIn";
import SlideIn from "@/components/Animations/slideIn";
import Button from "@/components/button";
import Input from "@/components/input";
import Logo from "@/components/logo";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Page = () => {
  const router = useRouter();

  const [states, setStates] = useState({
    phraseVerified: false,
    errors: {
      recoveryPhrase: false,
      question: false,
      answer: false,
      text: "",
    },
  });
  const [recoveryPhrase, setRecoveryPhrase] = useState<string | number>("");
  const [securityQuestion, setSecurityQuestion] = useState<string | number>("");
  const [answer, setAnswer] = useState<string | number>("");

  const recoverAccount = async () => {
    //
    if (!states.phraseVerified) {
      //First run this
      return;
    }

    if (states.phraseVerified) {
      return;
      //Then this
    }
  };

  return (
    <section className="w-full p-2 h-full">
      <div className="w-full h-full">
        <SlideIn>
          <div className="w-full flex items-center justify-between">
            <Button
              name="Back"
              disabled={false}
              onClick={() => router.back()}
              varient="outlined"
              className="h-[2.5rem] hover:text-white outline w-[20%] transition-all ease-linear  rounded-md"
            />
            <Logo color="purple" size="medium" />
          </div>
        </SlideIn>
        <FadeIn className="w-full h-full">
          <div className="w-full h-full flex flex-col gap-3 items-center justify-center">
            <div className="w-full flex flex-col gap-2">
              <p className="text-3xl text-purple-700">
                Recovering your account is as simple am ABC...
              </p>
              <span className="text-gray-500">
                Just enter your recovery phrase and we are good to go
              </span>
            </div>
            <div className="flex w-full flex-col gap-2">
              <Input
                value={recoveryPhrase as string}
                setValue={setRecoveryPhrase}
                type="text"
                error={false}
                disabled={false}
                placeholder="Recovery phrase"
              />
              {states.phraseVerified && (
                <div className="w-full flex flex-col gap-1 mt-3">
                  <p className="text-[1.5rem] text-purple-700 font-semibold">
                    Security question
                  </p>
                  <Input
                    value={securityQuestion as string}
                    setValue={setSecurityQuestion}
                    type="text"
                    error={false}
                    disabled={false}
                    placeholder="Security question"
                  />
                  <Input
                    value={answer as string}
                    setValue={setAnswer}
                    type="text"
                    error={false}
                    disabled={false}
                    placeholder="Your answer!"
                  />
                </div>
              )}
              <Button
                disabled={
                  states.phraseVerified
                    ? securityQuestion && answer && recoveryPhrase
                      ? false
                      : true
                    : recoveryPhrase
                    ? false
                    : true
                }
                className="h-[2.5rem] font-semibold"
                borderRadius={true}
                onClick={() => {}}
                name={states.phraseVerified ? "Submit" : "Verify phrase"}
                varient="filled"
              />
              {states.errors.text && (
                <span className="text-[0.9rem] text-red-700">
                  Something went wrong...
                </span>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default Page;
