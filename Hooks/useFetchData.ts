import { error } from "console";
import { useState, useEffect } from "react";

export interface FetchDataProps<T> {
  is_loading: boolean;
  error: boolean | null;
  data: T | null;
  options?: {};
}

export type FetchDataOptions = {
  url: string;
  retry?: boolean;
  interval?: number;
};

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
