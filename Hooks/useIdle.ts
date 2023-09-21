import { useEffect, useState } from "react";

export const useIdle = (timer: number) => {
  const [amIdle, setAmIdle] = useState(false);
  const [previous, setPrevious] = useState(0);

  const handleScroll = (e: MouseEvent) => {
    //
    setAmIdle(false);
    setPrevious(e.screenX);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleScroll);
    };
  }, []);

  useEffect(() => {
    const time = setTimeout(() => {
      previous !== 0 && setAmIdle(true);
    }, timer);

    return () => clearTimeout(time);
  }, [previous]);

  return amIdle;
};
