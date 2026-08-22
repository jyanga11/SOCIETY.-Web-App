import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Module-scoped flag persists across client navigations, resets on hard reload
let hasShownLoadingOnce = false;
export const getHasShownLoadingOnce = () => hasShownLoadingOnce;

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


  // GSAP Fade in
  useEffect(() => {
    if (!showLoading) return;
    if (!societyTitleRef.current || !staticTextRef.current) return;
  
    const tl = gsap.timeline();
  
    tl.fromTo(
      [societyTitleRef.current, staticTextRef.current],
      { opacity: 0, y: -30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
          setFadeInComplete(true);
          setShowCursor(true);
        }
      }
    );
  
    return () => { tl.kill(); };
  }, [showLoading]);




  // GSAP fade out after specified duration
  useEffect(() => {
    if (!showLoading) return;
  
    const hideTimer = setTimeout(() => {
      if (!loadingRef.current) {
        console.warn("Loading screen failed to hide because loadingRef is null.");
        return;
      }
  
      const el = loadingRef.current;
      const displace = document.getElementById('liquid-displace');
      const turbulence = document.getElementById('liquid-turbulence');
  
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          hasShownLoadingOnce = true;
          setShowLoading(false);
          window.dispatchEvent(new Event('loading-screen-complete')); // add this
        }
      });
  
      // 1. Ramp up the liquid distortion right before the wipe starts,
      //    so the edge is already rippling when it begins moving
      if (displace) {
        tl.to(displace, { attr: { scale: 45 }, duration: 0.6, ease: "power1.in" }, 0);
      }
  
      // 2. Let the turbulence drift slowly for organic, non-repeating movement
      if (turbulence) {
        tl.to(turbulence, {
          attr: { baseFrequency: "0.012 0.09" },
          duration: 2.2,
          ease: "sine.inOut",
        }, 0);
      }
  
      // 3. Fade out instead of a clip-path sweep
      tl.to(el, {
        opacity: 0,
        duration: 1.8,
        ease: "power2.inOut",
      }, 0.3)
  
      // 4. Settle the distortion back down as the wipe finishes,
      //    so it doesn't look chaotic right at the end
      if (displace) {
        tl.to(displace, { attr: { scale: 0 }, duration: 0.6, ease: "power2.out" }, "-=0.6");
      }
  
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
