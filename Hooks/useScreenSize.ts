import { useEffect, useState } from "react";

export const useScreenSize = () => {
  const newWindow = typeof window;
  const [screen, setScreen] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreen({ x: window.innerWidth, y: window.innerHeight });
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [newWindow]);
  return screen;
};
