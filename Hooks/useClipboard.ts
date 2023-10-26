import { useState } from "react";

const useClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);

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

  return { isCopied, copyToClipboard };
};

export default useClipboard;
