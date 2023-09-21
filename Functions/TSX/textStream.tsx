import React, { useState, useEffect } from "react";

const TextStreamer = ({
  text,
  speed,
  isDone,
}: {
  text: string;
  speed: number;
  isDone: boolean;
}) => {
  const [streamedText, setStreamedText] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (isDone) {
      return;
    }

    setStreamedText([]);

    const textInArray = text.split("");

    const timer = setInterval(() => {
      if (textInArray.length > 0) {
        setStreamedText((prevText) => [
          ...prevText,
          <span key={prevText.length}>{textInArray.shift()}</span>,
        ]);
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => {
      clearInterval(timer);
    };
  }, [text, speed]);

  return <>{isDone ? text : streamedText}</>;
};

export default TextStreamer;
