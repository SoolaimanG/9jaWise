import { useEffect, useState } from "react";

export type RandomNumberProps = {
  type: "normal" | "numberBetween" | "excludeNumber";
  within?: number;
  neverToGenerate?: number;
  between?: { max: number; min: number };
};

export const useRandomNumber = (
  props: RandomNumberProps
): number | undefined => {
  const { type, within, neverToGenerate, between } = props;
  const [number, setNumber] = useState<number | undefined>(undefined);

  useEffect(() => {
    switch (type) {
      case "normal":
        if (within !== undefined) {
          setNumber(Math.floor(Math.random() * within));
        }
        break;
      case "excludeNumber":
        if (neverToGenerate !== undefined) {
          let random;
          do {
            random = Math.floor(Math.random() * 100);
          } while (random === neverToGenerate);
          setNumber(random);
        }
        break;
      case "numberBetween":
        if (between) {
          const { max, min } = between;
          if (max > min) {
            setNumber(Math.floor(Math.random() * (max - min + 1)) + min);
          }
        }
        break;
      default:
        break;
    }
  }, [type, within, between, neverToGenerate]);

  return number;
};
