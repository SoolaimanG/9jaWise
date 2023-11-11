//Use this to perform optimitic updates on the ui >>

import { useEffect, useState } from "react";

interface optimitic_props<T> {
  data: T;
  action: () => T;
}

//
/**
 * useOptimistic - A custom React Hook for performing optimistic updates on the UI.
 *
 * @param {Object} options - An object with the following properties:
 * @param {T} options.data - The initial data to display on the UI.
 * @param {Function} options.action - A function that returns updated data to be displayed optimistically.
 *
 * @returns {[T | null, Function, Function]} An array with the following elements:
 *   - ui_update: The current UI data that reflects optimistic updates.
 *   - revert_update: A function to revert the UI data to its original state.
 *   - trigger_update: A function to trigger an update, causing the UI to display the result of the action function.
 */
export const useOptimistic = <T>({ data, action }: optimitic_props<T>) => {
  const [ui_update, setUi_update] = useState<T>(data);
  const [num, setNum] = useState(0);

  useEffect(() => {
    if (!num) return;

    // Update the UI with the result of the action function when triggered.
    setUi_update(action());
  }, [num, data]);

  /**
   * Reverts the UI data to the original state.
   */
  const revert_update = () => {
    setUi_update(data);
  };

  /**
   * Triggers an update, causing the UI to display the result of the action function.
   */
  const trigger_update = () => {
    setNum((prev) => prev + 1);
  };

  return [ui_update, revert_update, trigger_update];
};
