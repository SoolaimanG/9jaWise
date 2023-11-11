import { useEffect, useState } from "react";

/**
 * Custom React hook to determine the current time of day (Morning, Afternoon, or Evening).
 * @returns {"Morning" | "Afternoon" | "Evening"} - The current time of day.
 */
export const useCurrentTimeZone = () => {
  // Initialize the time state with a default value of "Evening"
  const [time, setTime] = useState<"Morning" | "Afternoon" | "Evening">(
    "Evening"
  );

  // Get the current hour from the system's local time
  const hour = new Date().getHours();

  // Use the `useEffect` hook to determine the time of day when the component mounts
  useEffect(() => {
    // Use a switch statement to categorize the time of day based on the current hour
    switch (true) {
      case hour >= 23:
        setTime("Evening"); // Set the time to "Evening" if the hour is 23 or greater.
        break;
      case hour >= 12:
        setTime("Afternoon"); // Set the time to "Afternoon" if the hour is 12 or greater.
        break;
      case hour >= 5:
        setTime("Morning"); // Set the time to "Morning" if the hour is 5 or greater.
        break;
      default:
        setTime("Evening"); // Set the time to "Evening" as a default fallback.
        break;
    }
  }, []); // The empty dependency array ensures this effect runs only once when the component mounts.

  // Return the current time of day.
  return time;
};
