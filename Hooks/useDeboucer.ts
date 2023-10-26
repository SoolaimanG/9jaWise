import { useEffect, useState } from "react";

export const useDebouncer = (input: string | number, time = 3000) => {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (!input) {
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    timer = setTimeout(() => {
      setIsTyping(false);
    }, time);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [input]);

  return isTyping;
};
