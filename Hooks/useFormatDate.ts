import { useState, useEffect } from "react";
import { format, isToday, isYesterday } from "date-fns";

export const useFormatDate = (date: number | string) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    const inputDate = new Date(date);

    if (isToday(inputDate)) {
      setFormattedDate(format(inputDate, "'today' h:mm a"));
    } else if (isYesterday(inputDate)) {
      setFormattedDate(format(inputDate, "'yesterday' h:mm a"));
    } else {
      setFormattedDate(format(inputDate, "dd MMM yyyy h:mm a"));
    }
  }, [date]);

  return formattedDate?.[0]
    .toUpperCase()
    .concat(formattedDate.slice(1, formattedDate.length));
};
