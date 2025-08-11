import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const useLoadingScreen = (duration: number = 10000) => {
  const [showLoading, setShowLoading] = useState(true);
  const [fadeInComplete, setFadeInComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(false);

  const societyTitleRef = useRef(null);
  const staticTextRef = useRef(null);
  const typingTextRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
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
  }, []);

  // Hide loading screen after specified duration
  useEffect(() => {
    const hideTimer = setTimeout(() => {
      // GSAP fade out animation
      const tl = gsap.timeline();
      
      tl.to([societyTitleRef.current, staticTextRef.current, typingTextRef.current, cursorRef.current], {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.in",
        stagger: 0.1
      })
      .to(".loading-container", {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => setShowLoading(false)
      });

      return () => {
        tl.kill();
      };
    }, duration);

    return () => clearTimeout(hideTimer);
  }, [duration]);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return {
    showLoading,
    fadeInComplete,
    showCursor,
    refs: { societyTitleRef, staticTextRef, typingTextRef, cursorRef }
  };
};
