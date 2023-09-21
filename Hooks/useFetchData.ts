import { useState, useEffect } from "react";

export interface FetchDataProps<T> {
  is_loading: boolean;
  error: number | null;
  data: T | null;
}

export type FetchDataOptions = {
  url: string;
  retry?: boolean;
  interval?: number;
};

export const useFetchData = <T>(
  options: FetchDataOptions,
  dependencies: any[] = []
) => {
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
        setState({ is_loading: false, error: res.status, data: null });
      }
    } catch (error) {
      setState({ is_loading: false, error: 500, data: null });
    }
  };

  useEffect(() => {
    fetchData();

    if (retry) {
      const intervalId = setInterval(fetchData, interval);

      return () => clearInterval(intervalId);
    }
  }, [...dependencies, interval]);

  return state;
};
