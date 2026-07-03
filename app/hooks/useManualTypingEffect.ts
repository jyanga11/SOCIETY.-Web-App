import { useState, useEffect, useCallback } from 'react';

/**
 * Like useTypingEffect, but:
 * - types forward only (no backspace/delete)
 * - holds the finished phrase instead of auto-advancing
 * - phrase changes are driven manually via next()/prev()
 */
export const useManualTypingEffect = (
  phrases: readonly string[],
  speedMs: number = 10 // fast by default; useTypingEffect uses 105
) => {
  const [displayText, setDisplayText] = useState("");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    setDisplayText("");
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      if (currentIndex <= phrases[currentPhraseIndex].length) {
        setDisplayText(phrases[currentPhraseIndex].slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, speedMs);

    return () => clearInterval(typeInterval);
  }, [currentPhraseIndex, phrases, speedMs]);

  const next = useCallback(() => {
    setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
  }, [phrases.length]);

  const prev = useCallback(() => {
    setCurrentPhraseIndex((prev) => (prev - 1 + phrases.length) % phrases.length);
  }, [phrases.length]);

  return { displayText, currentPhraseIndex, isTyping, next, prev };
};