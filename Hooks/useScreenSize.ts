import { useEffect, useState } from "react";

export const useScreenSize = () => {
  // Check if the `window` object is available
  const isWindowAvailable = typeof window !== "undefined";

  // Initialize the `screen` state with default values
  const [screen, setScreen] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      if (isWindowAvailable) {
        // Update the `screen` state with the current screen dimensions
        setScreen({ x: window.innerWidth, y: window.innerHeight });
      }
    };

    // Initialize the `screen` state with the current screen dimensions
    handleResize();

    // Add an event listener to handle screen size changes
    if (isWindowAvailable) {
      window.addEventListener("resize", handleResize);
    }

    // Remove the event listener when the component unmounts
    return () => {
      if (isWindowAvailable) {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, [isWindowAvailable]);

  return screen;
};
