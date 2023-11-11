import { useState } from "react";

/**
 *
 * @returns {boolean, Function} A boolean to tell if the value is copied successfully or not and a function to use to copy the value with and argument of textToCopy which will be a string
 */

const useClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);

  //A function to be use to copy value to clipboard with an arg which is a string type
  const copyToClipboard = async (textToCopy: string) => {
    try {
      await navigator.clipboard
        .writeText(textToCopy)
        .then(() => setIsCopied(true));
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy to clipboard error:", error);
      setIsCopied(false);
    }
  };

  return { isCopied, copyToClipboard }; //Is Copied tells if the value is copy to clipboard and a function to copy to clipboard
};

export default useClipboard;
