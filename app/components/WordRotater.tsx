'use client';

import React, { useState, useEffect } from 'react';
import { useTypingEffect } from '../hooks/useTypingEffect';

interface WordRotaterProps {
  phrases: readonly string[];
  textClassName?: string;
}

export const WordRotater = ({
  phrases,
  textClassName = ""
}: WordRotaterProps) => {
  const { displayText } = useTypingEffect(phrases, true);
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor effect isolated to this component
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
      <span className={`inline-block text-left relative ${textClassName}`}>
        {displayText}
        <span 
          className={`ml-1 inline-block w-[15px] h-[0.9em] bg-current align-middle transition-opacity duration-100 ${
            showCursor ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />
      </span>
  );
};