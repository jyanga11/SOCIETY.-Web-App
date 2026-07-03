'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useManualTypingEffect } from '../hooks/useManualTypingEffect';

interface ManualWordRotaterProps {
  phrases: readonly string[];
  textClassName?: string;
  speedMs?: number;
}

export const ManualWordRotater = ({
  phrases,
  textClassName = "",
  speedMs = 7,
}: ManualWordRotaterProps) => {
  const { displayText, next, prev } = useManualTypingEffect(phrases, speedMs);
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor effect, independent of typing state
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="relative h-[260px]">
      <span className={`inline-block text-left relative ${textClassName}`}>
        {displayText}
        <span
          className={`inline-block w-[10px] sm:w-[15px] h-[0.9em] bg-current align-middle transition-opacity duration-100 ${
            showCursor ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />
      </span>
      <div className="absolute bottom-0 left-0 flex flex-row">
        <button onClick={prev} aria-label="Previous phrase">
          <ChevronLeft size={30}/>
        </button>
        <button onClick={next} aria-label="Next phrase">
          <ChevronRight size={30}/>
        </button>
      </div>
    </div>
  );
};