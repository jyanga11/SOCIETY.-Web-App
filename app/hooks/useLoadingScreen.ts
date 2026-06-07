import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Module-scoped flag persists across client navigations, resets on hard reload
let hasShownLoadingOnce = false;

export const useLoadingScreen = (duration: number = 100) => {
  const [showLoading, setShowLoading] = useState(true);
  const [fadeInComplete, setFadeInComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(false);

  const loadingRef = useRef<HTMLDivElement | null>(null);
  const societyTitleRef = useRef(null);
  const staticTextRef = useRef(null);
  const typingTextRef = useRef(null);
  const cursorRef = useRef(null);

  // Decide whether to show loading (show on first mount per page lifecycle; skip on client navigations after it already showed)
  useEffect(() => {
    if (hasShownLoadingOnce) {
      setShowLoading(false);
    } else {
      setShowLoading(true);
    }
  }, []);

  useEffect(() => {
    if (!showLoading) return;

    if (!societyTitleRef.current || !staticTextRef.current) return;

    // GSAP fade in animation
    const tl = gsap.timeline();
    
    tl.fromTo([societyTitleRef.current, staticTextRef.current], 
      { opacity: 0, y: -30 }, 
      { opacity: 1, y: 0, duration: 1, ease: "power2.out", onComplete: () => {
        setFadeInComplete(true);
        setShowCursor(true);
      }}
    );

    return () => {
      tl.kill();
    };
  }, [showLoading]);

  // Hide loading screen after specified duration
  useEffect(() => {
    if (!showLoading) return;
  
    const hideTimer = setTimeout(() => {
      // If this ref is null, the loading screen hangs forever!
      if (!loadingRef.current) {
        console.warn("Loading screen failed to hide because loadingRef is null.");
        return;
      }
  
      const tl = gsap.timeline();
      
      // Fade out the entire screen container
      tl.to(loadingRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          hasShownLoadingOnce = true; // Mark as shown
          setShowLoading(false);       // This removes it from the DOM
        }
      });
  
    }, duration);
  
    return () => clearTimeout(hideTimer);
  }, [duration, showLoading]);

  // Blinking cursor effect
  useEffect(() => {
    if (!showLoading) return;
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, [showLoading]);

  return {
    showLoading,
    fadeInComplete,
    showCursor,
    refs: { loadingRef, societyTitleRef, staticTextRef, typingTextRef, cursorRef }
  };
};
