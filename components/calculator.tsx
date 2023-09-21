import React, { SetStateAction, useEffect, useState } from "react";

export type funcProps = "multiply" | "add" | "subtract" | "divide";

export type props = {
  sign: "+" | "-" | "*" | "/";
  func: funcProps;
};

export const calcSigns: props[] = [
  {
    sign: "+",
    func: "add",
  },
  {
    sign: "-",
    func: "subtract",
  },
  {
    sign: "*",
    func: "multiply",
  },
  {
    sign: "/",
    func: "divide",
  },
];

export type calculatorProps = {
  numbers: number;
  setNumbers: React.Dispatch<SetStateAction<number>>;
};

//D-6 and D-7 are use to track the nature of multiplication and division(havenot created a calculator before tho this might not be ideal).preventing unnecessary bugs

const Calculator = (props: calculatorProps) => {
  const { numbers, setNumbers } = props;
  const [value, setValue] = useState("0");
  const [dtrack, setDTrack] = useState<"first" | "second">("first"); //[D-6]
  const [mtrack, setMTrack] = useState<"first" | "second">("first"); //[D-7]
  const [opp, setOpp] = useState<funcProps | null>();

  const joiningNumbers = (n: string) => {
    setValue((prev) => prev + n);
  };

  const handleCalculations = (func: funcProps) => {
    switch (func) {
      case "add":
        setNumbers((prev) => prev + Number(value.substring(1)));
        break;
      case "divide":
        if (dtrack === "first") {
          setNumbers(numbers ? numbers : Number(value.substring(1)));
          setDTrack("second");
        } else if (dtrack === "second") {
          //This had to be nested because of preventing INFINITY from the result
          if (Number(value.substring(1)) === 0) {
            alert("Cannot divide by zero");
          }
          setNumbers((prev) => prev / Number(value.substring(1)));
          setDTrack("first");
        }
        break;
      case "multiply":
        if (mtrack === "first") {
          setNumbers(numbers ? numbers : Number(value.substring(1)));
          setMTrack("second");
        } else if (mtrack === "second") {
          //This had to be nested because of preventing INFINITY from the result
          setNumbers((prev) => prev * Number(value.substring(1)));
          setMTrack("first");
        }
        break;
      case "subtract":
        setNumbers((prev) => prev - Number(value.substring(1)));
        break;
      default:
        break;
    }

    setValue("0");
  };

  //This exists because i wanted it to could have short handed it.
  const handleTotalCalc = () => {
    handleCalculations(opp as funcProps);
    setOpp(null);
  };

  const clearCalulations = () => {
    setOpp(null);
    setNumbers(0);
    setValue("0");
    setDTrack("first");
    setMTrack("first");
  };

  return (
    <div className="w-full p-1 flex items-center flex-col gap-2 transition-all delay-75 ease-in">
      <div className="w-full grid-cols-3 grid-rows-3 grid gap-2">
        {/* @ts-ignore */}
        {Array.from(
          { length: 9 },
          (
            _,
            i //[D-5] -->Easy way of getting numbers with manualling setting everything yourself
          ) => (
            <button
              onClick={() => joiningNumbers((i + 1).toString())}
              className="px-6 py-2 hover:bg-purple-600 bg-purple-500 text-white dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-purple-600 rounded-sm"
              key={i + 1}
            >
              {i + 1}
            </button>
          )
        )}
        <button
          onClick={() => joiningNumbers((0).toString())}
          className="px-6 py-2 hover:bg-purple-600 bg-purple-500 text-white dark:bg-slate-700 dark:text-purple-600 grid dark:hover:bg-slate-600 place-items-center rounded-sm"
          key={0}
        >
          {0}
        </button>
        {calcSigns.map((c, i) => (
          <button
            onClick={() => {
              setOpp(c.func);

              handleCalculations(c.func);
            }}
            className="px-6 py-2 bg-purple-900 hover:bg-purple-700 dark:bg-slate-500 dark:hover:bg-slate-700 text-gray-200 grid place-items-center rounded-sm"
            key={i}
          >
            {c.sign}
          </button>
        ))}
        <button
          onClick={() => {
            handleTotalCalc();
          }}
          className="px-6 py-2 hover:bg-purple-700 dark:hover:bg-slate-700 bg-purple-900 dark:bg-slate-500 text-gray-200 grid place-items-center rounded-sm"
          key={"="}
        >
          =
        </button>
      </div>
      <button
        onClick={clearCalulations}
        className="w-full py-2 rounded-sm bg-red-200 hover:bg-red-500 hover:text-white text-red-700"
      >
        Clear
      </button>
    </div>
  );
};

export default Calculator;
