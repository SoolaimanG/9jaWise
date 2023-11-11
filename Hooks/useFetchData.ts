import { useState, useEffect } from "react";

/**
 * Represents the data structure returned by the useFetchData hook.
 * @template T - The data type that the hook fetches.
 */
export interface FetchDataProps<T> {
  is_loading: boolean; // Indicates if data is currently being fetched.
  error: boolean | null; // Indicates if an error occurred during fetching.
  data: T | null; // The fetched data or null if an error occurred.
  options?: {}; // Additional options for future use.
}

/**
 * Represents the options for configuring the useFetchData hook.
 */
export type FetchDataOptions = {
  url: string; // The URL from which to fetch data.
  retry?: boolean; // Whether to retry fetching if an error occurs.
  interval?: number; // The interval (in milliseconds) for retrying fetch requests.
};

/**
 * Custom React hook for fetching data from a specified URL with error handling and retry options.
 * @template T - The data type to fetch.
 * @param {FetchDataOptions} options - Configuration options for data fetching.
 * @returns {FetchDataProps<T>} - A state object containing loading, error, and data information.
 */
export const useFetchData = <T>(options: FetchDataOptions) => {
  const { url, interval, retry } = options;
  const [state, setState] = useState<FetchDataProps<T>>({
    is_loading: false,
    error: null,
    data: null,
  });

  const fetchData = async () => {
    setState({ is_loading: true, error: null, data: null });
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setState({ is_loading: false, error: null, data });
      } else {
        setState({ is_loading: false, error: true, data: null });
      }
    } catch (error) {
      setState({ is_loading: false, error: true, data: null });
    }
  };

  useEffect(() => {
    fetchData();

    if (retry && state.error) {
      const intervalId = setInterval(fetchData, interval);

      return () => clearInterval(intervalId);
    }
  }, [interval]);

  return state;
};
