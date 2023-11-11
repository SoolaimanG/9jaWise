import { useEffect, useState } from "react";

/**
 * Configuration for cache management.
 * @template T - Type of data to be stored in the local storage.
 */
export interface storageProps<T> {
  type: "get" | "add";
  data?: { addKey: string; value: T };
  key?: string;
}

/**
 * A custom hook for managing session storage cache.
 * @param {storageProps} props - Configuration for cache management.
 * @returns {T | null} - Cached data if available, or undefined.
 */
export const useLocalStorage = <T>({
  type,
  data,
  key,
}: storageProps<T>): T | null => {
  // Check if the window object is available (for server-side rendering)
  const newWindow: Window | null =
    typeof window !== "undefined" ? window : null;
  // State variable to store the cached data
  const [cachedData, setCachedData] = useState<T | null>(null);

  useEffect(() => {
    // Handle the "get" type to retrieve data from local storage by key
    if (type === "get" && key) {
      // Retrieve data from local storage by the provided key
      const storedData = newWindow?.localStorage.getItem(key);

      // Check if data is available in local storage
      if (storedData) {
        // Parse the retrieved data as JSON and cast it to the specified data type
        const parsedData = JSON.parse(storedData) as T;
        // Update the cached data state with the retrieved data
        setCachedData(parsedData);
      }
    }
    // Handle the "add" type to store data in local storage
    else if (type === "add" && data) {
      const { addKey, value } = data;
      // Store the data in local storage by the provided key after converting it to JSON
      newWindow?.localStorage.setItem(addKey, JSON.stringify(value));
    }
  }, [data, type]);

  // Return the cached data, which may be null if not found in local storage
  return cachedData;
};
