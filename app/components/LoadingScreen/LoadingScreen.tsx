'use client';

import { useLoadingScreen } from '../../hooks/useLoadingScreen';
import { useTypingEffect } from '../../hooks/useTypingEffect';
import { LOADING_PHRASES } from '../../constants/phrases';

export const LoadingScreen = () => {
  const { showLoading, fadeInComplete, showCursor, refs } = useLoadingScreen();
  const { displayText } = useTypingEffect(LOADING_PHRASES, fadeInComplete);
  
  const staticText = "is a ";

  if (!showLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white fixed inset-0 z-50 loading-container">
      <div className="text-center">
        <h1 className="font-semibold mb-4">
          <span ref={refs.societyTitleRef} className="font-arts-crafts-regular text-2xl sm:text-4xl md:text-6xl">society.</span>
          <span ref={refs.staticTextRef} className="font-sans text-lg sm:text-4xl md:text-4xl"> {staticText}</span>
          <span ref={refs.typingTextRef} className="font-sans text-lg sm:text-4xl md:text-4xl inline-block w-48 sm:w-80 md:w-96 text-left">
            {displayText}
            <span ref={refs.cursorRef} className={`ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
              <div className="inline-block w-4 h-8 sm:w-4 sm:h-8 md:w-3 md:h-6 bg-white"></div>
            </span>
          </span>
        </h1>
        <div className="animate-pulse h-12 w-36 border-b-2 border-white mx-auto"></div>
      </div>
    </div>
  );
};
