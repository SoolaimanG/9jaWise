import { useEffect, useState } from "react";

/**
 * Custom React hook to track changes in a value and provide a debounced state.
 * @param {string | number | boolean} changing - The value to track changes for.
 * @param {number} time - The time (in milliseconds) to delay before considering the value as "ready".
 * @returns {["default" | "changing" | "ready", () => void]} - A tuple with the current state ("default", "changing", or "ready")
 * and a reset function to set the state back to "default".
 */
export const useDebouncer = (
  changing: string | number | boolean,
  time = 3000
) => {
  // Track whether the user input is changing or not
  const [input_changing, setInput_changing] = useState<
    "default" | "changing" | "ready"
  >("default");

  // Reset function to set the input state to 'default'
  const reset = () => {
    return setInput_changing("default");
  };

  // Use the `useEffect` hook to set a timer for debouncing when 'changing' occurs
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null; // Use this to clear the timer later

    // If the input !== 'changing', set the input to 'default'
    setInput_changing("default");

    // Perform a timeout here for the provided time or use the default (3000 ms)
    setInput_changing("changing");
    timer = setTimeout(() => {
      setInput_changing("ready");
    }, time);

    // Clear the timer when the component unmounts or when the input changes
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [changing]);

  // Return the current state of input changing ('default', 'changing', or 'ready')
  // and a reset function to set the input back to 'default'
  return [input_changing, reset];
};
