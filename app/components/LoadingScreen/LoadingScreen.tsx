'use client';

import { useLoadingScreen } from '../../hooks/useLoadingScreen';
import { WordRotater } from '../WordRotater'; // Double check your import path
import { PHRASES } from '../../constants/phrases';

export const LoadingScreen = () => {
  // We pass a concrete duration here (e.g., 3000ms for 3 seconds)
  // If duration is too low or undefined, ensure it has a fallback in the hook
  const { showLoading, fadeInComplete, refs } = useLoadingScreen(3000); 
  
  const staticText = "is a ";

  if (!showLoading) return null;

  return (
    // CRITICAL: Ensure ref={refs.loadingRef} is on this outer div!
    <div ref={refs.loadingRef} className="min-h-screen flex items-center justify-center bg-black text-white fixed inset-0 z-50 loading-container">
      <div className="text-center">
        <h1 className="font-semibold mb-4 flex items-center justify-center">
          <span ref={refs.societyTitleRef} className="font-arts-crafts-regular text-2xl sm:text-4xl md:text-6xl">SoCIETY.</span>
          
          <span ref={refs.staticTextRef} className="font-sans text-lg sm:text-4xl md:text-4xl ml-2">
            {fadeInComplete && (
              <WordRotater 
                phrases={PHRASES} 
                staticText={staticText}
                textClassName="w-48 sm:w-80 md:w-96"
              />
            )}
          </span>
        </h1>
        <div className="animate-pulse h-12 w-36 border-b-2 border-white mx-auto"></div>
      </div>
    </div>
  );
};