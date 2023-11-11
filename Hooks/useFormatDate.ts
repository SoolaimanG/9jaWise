import { useState, useEffect } from "react";
import { format, isToday, isYesterday } from "date-fns";

/**
 * Custom React hook for formatting a date into a human-readable format.
 * @param {number | string} date - The date to format, which can be a timestamp (number) or a date string.
 * @returns {string | null} - The formatted date string or null if the input date is invalid.
 */
export const useFormatDate = (date: number | string) => {
  // State to store the formatted date
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    // Convert the input date to a Date object
    const inputDate = new Date(date);

    if (!isNaN(inputDate.getTime())) {
      // Check if the input date is today
      if (isToday(inputDate)) {
        setFormattedDate(format(inputDate, "'today' h:mm a"));
      }
      // Check if the input date is yesterday
      else if (isYesterday(inputDate)) {
        setFormattedDate(format(inputDate, "'yesterday' h:mm a"));
      } else {
        // Format the date in the "dd MMM yyyy h:mm a" format
        setFormattedDate(format(inputDate, "dd MMM yyyy h:mm a"));
      }
    } else {
      // Handle invalid input date (not a valid timestamp or date string)
      setFormattedDate(null);
    }
  }, [date]);

  return formattedDate
    ? formattedDate[0].toUpperCase() + formattedDate.slice(1)
    : null;
};
