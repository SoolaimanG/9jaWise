import { useEffect, useState } from "react";

export const useCurrentTimeZone = () => {
  const [time, setTime] = useState<"Morning" | "Afternoon" | "Evening">(
    "Evening"
  );
  const hour = new Date().getHours();

  useEffect(() => {
    switch (true) {
      case hour >= 23:
        setTime("Evening");
        break;
      case hour >= 12:
        setTime("Afternoon");
        break;
      case hour >= 5:
        setTime("Morning");
        break;
      default:
        setTime("Evening");
        break;
    }
  }, []);

  return time;
};
