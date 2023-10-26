import { useEffect, useState } from "react";

export interface storageProps<T> {
  type: "get" | "add";
  data?: { addKey: string; value: T };
  key?: string;
}

/**
 * A custom hook for managing session storage cache.
 * @param props - Configuration for cache management.
 * @returns Cached data if available, or undefined.
 */
export const useLocalStorage = <T>({
  type,
  data,
  key,
}: storageProps<T>): T | null => {
  const newWindow: Window | null =
    typeof window !== "undefined" ? window : null;
  const [cachedData, setCachedData] = useState<T | null>(null);

  useEffect(() => {
    if (type === "get" && key) {
      const storedData = newWindow?.localStorage.getItem(key);

      if (storedData) {
        const parsedData = JSON.parse(storedData) as T;
        setCachedData(parsedData);
      }
    } else if (type === "add" && data) {
      const { addKey, value } = data;
      newWindow?.localStorage.setItem(addKey, JSON.stringify(value));
    }
  }, [data, type]);

  return cachedData;
};
