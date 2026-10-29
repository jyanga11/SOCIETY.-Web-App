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
      <span className={`inline-grid w-full min-w-0 text-left relative ${textClassName}`}>
        {/* Overlapping full phrases reserve the tallest wrapped height. */}
        {phrases.map((phrase, index) => (
          <span
            key={index}
            aria-hidden="true"
            className="invisible pointer-events-none col-start-1 row-start-1 min-w-0"
          >
            {phrase}
            <span className="inline-block w-[10px] sm:w-[15px] h-[0.9em] align-middle" />
          </span>
        ))}
        <span className="col-start-1 row-start-1 min-w-0 self-start">
        {displayText}
        <span 
          className={`inline-block w-[10px] sm:w-[15px] h-[0.9em] bg-current align-middle transition-opacity duration-100 ${
            showCursor ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />
        </span>
      </span>
  );
};
