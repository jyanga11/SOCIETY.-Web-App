import { useState, useEffect } from 'react';

export const useTypingEffect = (phrases: string[], isActive: boolean) => {
  const [displayText, setDisplayText] = useState("");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    // Only start typing after fade in is complete
    if (!isActive) return;

    let typeInterval: NodeJS.Timeout;
    let backspaceInterval: NodeJS.Timeout;
    let pauseTimer: NodeJS.Timeout;

    if (isTyping) {
      // Typing effect
      let currentIndex = 0;
      typeInterval = setInterval(() => {
        if (currentIndex <= phrases[currentPhraseIndex].length) {
          setDisplayText(phrases[currentPhraseIndex].slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          // Pause before backspacing
          pauseTimer = setTimeout(() => {
            setIsTyping(false);
          }, 1000); // Wait 1 second before backspacing
        }
      }, 105); // Speed of typing
    } else {
      // Backspacing effect
      let currentIndex = phrases[currentPhraseIndex].length;
      backspaceInterval = setInterval(() => {
        if (currentIndex >= 0) {
          setDisplayText(phrases[currentPhraseIndex].slice(0, currentIndex));
          currentIndex--;
        } else {
          clearInterval(backspaceInterval);
          // Move to next phrase
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
          setIsTyping(true);
        }
      }, 70); // Faster backspacing
    }

    return () => {
      clearInterval(typeInterval);
      clearInterval(backspaceInterval);
      clearTimeout(pauseTimer);
    };
  }, [isTyping, currentPhraseIndex, phrases, isActive]);

  return { displayText, currentPhraseIndex, isTyping };
};
