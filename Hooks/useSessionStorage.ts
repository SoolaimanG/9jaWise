/**
 * Main idea behind this is because i want to make my own cache techique without using any library
 * If you find a better solution message soolaimangee@gmail.com
 */

import { useEffect, useState } from "react";

export interface storageProps<T> {
  type: "get" | "add";
  data?: { addKey: string; value: string };
  key?: string;
}

/**
 * A custom hook for managing session storage cache.
 * @param props - Configuration for cache management.
 * @returns Cached data if available, or undefined.
 */
export const useSessionStorage = <T>({
  type,
  data,
  key,
}: storageProps<T>): T | null => {
  const newWindow: Window | null =
    typeof window !== "undefined" ? window : null;
  const [cachedData, setCachedData] = useState<T | null>(null);

  useEffect(() => {
    if (type === "get" && key) {
      const storedData = newWindow?.sessionStorage.getItem(key);

      if (storedData) {
        const parsedData = JSON.parse(storedData) as T;
        setCachedData(parsedData);
      }
    } else if (type === "add" && data) {
      const { addKey, value } = data;
      newWindow?.sessionStorage.setItem(addKey, JSON.stringify(value));
    }
  }, [data, type]);

  return cachedData;
};
