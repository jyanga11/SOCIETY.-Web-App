'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { getHasShownLoadingOnce } from '../../hooks/useLoadingScreen';

export const FadeInWrapper = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (getHasShownLoadingOnce()) {
      gsap.fromTo(ref.current, { opacity: 0 }, {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          window.dispatchEvent(new Event('home-content-fade-in-complete'));
        }
      });
      return;
    }

    gsap.set(ref.current, { opacity: 0 });

    const handleComplete = () => {
      gsap.to(ref.current, {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
          window.dispatchEvent(new Event('home-content-fade-in-complete'));
        }
      });
    };

    window.addEventListener('loading-screen-complete', handleComplete);
    return () => window.removeEventListener('loading-screen-complete', handleComplete);
  }, []);

  return <div ref={ref}>{children}</div>;
};