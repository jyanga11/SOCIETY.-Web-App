'use client';

import { useLoadingScreen } from '../../hooks/useLoadingScreen';
import { WordRotater } from '../WordRotater'; // Double check your import path
import { PHRASES } from '../../constants/phrases';

export const LoadingScreen = () => {
  // We pass a concrete duration here (e.g., 3000ms for 3 seconds)
  // If duration is too low or undefined, ensure it has a fallback in the hook
  const { showLoading, fadeInComplete, refs } = useLoadingScreen(3000); 

  if (!showLoading) return null;

  return (
    // CRITICAL: Ensure ref={refs.loadingRef} is on this outer div!
    <div ref={refs.loadingRef} className="min-h-screen flex items-center justify-center bg-black text-white fixed inset-0 z-50 loading-container">
      <div className="w-full max-w-4xl mx-auto px-4">
        {/* Using a grid to lock the alignment point */}
        <h1 className="mb-4 grid grid-cols-2 gap-2 items-baseline">
          {/* Left column: Right-aligned static text */}
          <span ref={refs.societyTitleRef} className="font-arts-crafts-regular text-2xl sm:text-6xl text-right whitespace-nowrap">
            SoCIETY.
            <span className="text-xl sm:text-5xl font-sans">&nbsp;is a&thinsp;</span>
          </span> 
          
          {/* Right column: Left-aligned typing text */}
          <span ref={refs.staticTextRef} className="font-sans text-lg sm:text-4xl md:text-4xl text-left">
            {fadeInComplete && (
              <WordRotater 
                phrases={PHRASES} 
                textClassName="text-xl sm:text-5xl"
              />
            )}
          </span>
        </h1>
        <div className="animate-pulse h-12 w-36 border-b-2 border-white mx-auto"></div>
      </div>
    </div>
  );
};