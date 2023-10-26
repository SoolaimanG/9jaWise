import { useEffect, useState } from "react";

export interface OptimisticProps<T> {
  data: T;
  applyOptimistic: () => any; // Adjust the return type to match your use case
}

//[Reference to chatGPT for suggesting the reverteOptimisticUpdate]
/**
 * see @ https://www.chat.openai.com/
 * @param props
 * @returns
 */

export const useOptimistic = <T>(props: OptimisticProps<T>) => {
  const { data, applyOptimistic } = props;
  const [addData, setAddData] = useState<T | null>(null);

  useEffect(() => {
    const updatedData = applyOptimistic();
    setAddData(updatedData);
  }, [data]);

  const revertOptimisticUpdate = () => {
    // Revert to the original data when there is an error
    setAddData(data);
  };

  return [addData, revertOptimisticUpdate];
};
