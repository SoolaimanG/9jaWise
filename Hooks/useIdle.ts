import { useEffect, useState } from "react";

/**
 * Custom React hook for detecting user idle state.
 * @param {number} timer - The idle detection time in milliseconds.
 * @returns {boolean} - A boolean indicating whether the user is idle or not.
 */
export const useIdle = (timer: number) => {
  // State to track the user's idle state
  const [amIdle, setAmIdle] = useState(false);
  // State to track the previous screen X coordinate
  const [previous, setPrevious] = useState(0);

  // Event handler to reset the idle state on mouse movement
  const handleScroll = (e: MouseEvent) => {
    setAmIdle(false);
    setPrevious(e.screenX);
  };

  // Set up an event listener for mouse movement when the component mounts
  useEffect(() => {
    window.addEventListener("mousemove", handleScroll);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("mousemove", handleScroll);
    };
  }, []);

  // Set up a timer to check for user idle state based on mouse movement
  useEffect(() => {
    const time = setTimeout(() => {
      // Check if the screenX coordinate changed (indicating mouse movement)
      // If it hasn't changed, set the user to idle
      previous !== 0 && setAmIdle(true);
    }, timer);

    // Clear the timer when the component unmounts or when the previous screenX changes
    return () => clearTimeout(time);
  }, [previous]);

  return amIdle;
};
