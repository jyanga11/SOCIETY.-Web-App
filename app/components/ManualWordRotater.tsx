'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useManualTypingEffect } from '../hooks/useManualTypingEffect';

interface ManualWordRotaterProps {
  phrases: readonly string[];
  textClassName?: string;
  speedMs?: number;
  onIndexChange?: (index: number) => void;
}

export const ManualWordRotater = ({
  phrases,
  textClassName = "",
  speedMs = 7,
  onIndexChange,
}: ManualWordRotaterProps) => {
  const { displayText, next, prev, phraseIndex } = useManualTypingEffect(phrases, speedMs);
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor effect, independent of typing state
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
  onIndexChange?.(phraseIndex);
  }, [phraseIndex, onIndexChange]);

  return (
    <div className="flex flex-col">
      <span className={`inline-grid w-full min-w-0 text-left relative ${textClassName}`}>
        {/* Full phrases overlap to reserve the tallest wrapped height. */}
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
      <div className="flex flex-row mt-4">
        <button onClick={prev} aria-label="Previous phrase">
          <ChevronLeft size={30} className="cursor-pointer hover:text-orange-500 hover:scale-110 transition-all duration-300"/>
        </button>
        <button onClick={next} aria-label="Next phrase">
          <ChevronRight size={30} className="cursor-pointer hover:text-orange-500 hover:scale-110 transition-all duration-300"/>
        </button>
      </div>
    </div>
  );
};
