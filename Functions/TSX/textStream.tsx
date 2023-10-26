import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const TextStreamer = ({ text, speed }: { text: string; speed: number }) => {
  const [streamedText, setStreamedText] = useState<JSX.Element[]>([]);
  const textInArray = text?.split("");

  useEffect(() => {
    if (!text) return;

    let timeoutIds: NodeJS.Timeout[] = [];

    const newJSX = textInArray.map((element, index) => (
      <span key={index}>{element}</span>
    ));

    textInArray.forEach((_, index) => {
      const timeoutId = setTimeout(() => {
        setStreamedText(newJSX.slice(0, index + 1));
      }, speed * index);

      timeoutIds.push(timeoutId);
    });

    // Cleanup timeouts when the component unmounts or text changes
    return () => {
      timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, [text, speed]);

  return <>{streamedText}</>;
};

TextStreamer.propTypes = {
  text: PropTypes.string.isRequired,
  speed: PropTypes.number.isRequired,
};

export default TextStreamer;
