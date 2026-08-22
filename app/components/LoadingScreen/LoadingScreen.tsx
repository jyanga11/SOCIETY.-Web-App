'use client';

import { useLoadingScreen } from '../../hooks/useLoadingScreen';
import { WordRotater } from '../WordRotater'; // Double check your import path
import { PHRASES } from '../../constants/phrases';

export const LoadingScreen = () => {
  // We pass a concrete duration here (e.g., 3000ms for 3 seconds)
  // If duration is too low or undefined, ensure it has a fallback in the hook
  const { showLoading, fadeInComplete, refs } = useLoadingScreen(11000); 

  if (!showLoading) return null;

  return (
    // Ensure ref={refs.loadingRef} is on this outer div!
    <div ref={refs.loadingRef} className="relative z-100 min-h-screen flex items-center justify-center bg-black text-white fixed inset-0 z-50 loading-container">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="liquid-distort" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              id="liquid-turbulence"
              type="fractalNoise"
              baseFrequency="0.008 0.06"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              id="liquid-displace"
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div className="w-full max-w-7xl mx-auto px-4">
      <h1 className="mb-4 flex flex-nowrap items-baseline justify-center text-center overflow-x-hidden">
        <span ref={refs.societyTitleRef} className="whitespace-nowrap shrink-0">
          <span className="font-arts-crafts-regular text-2xl sm:text-6xl">Society.</span>
          <span className="font-[Futura,Montserrat,Franklin_Gothic] text-xl sm:text-5xl">&nbsp;is a&nbsp;</span>
        </span>

        <span
          ref={refs.staticTextRef}
          className="relative inline-block whitespace-nowrap text-left align-baseline text-xl sm:text-5xl leading-tight pb-1"
        >
          <span className="invisible whitespace-nowrap" aria-hidden="true">
            {PHRASES.reduce((a, b) => (a.length > b.length ? a : b))}
          </span>
          <span className="absolute inset-0 whitespace-nowrap text-left">
            {fadeInComplete && (
              <WordRotater phrases={PHRASES} textClassName="text-xl sm:text-5xl" />
            )}
          </span>
        </span>
      </h1>
      </div>
    </div>
  );
};