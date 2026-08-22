'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { usePathname } from 'next/navigation';
import Header from './Header';

export const HeaderFadeIn = () => {
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!ref.current) return;

    if (pathname !== '/') {
      // No loading screen on this route — fade in right away
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", clearProps: "transform" }
      );
      return;
    }

    gsap.set(ref.current, { opacity: 0, y: -20 });

    const fadeIn = () => {
      gsap.to(ref.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        clearProps: "transform"
      });
    };

    window.addEventListener('home-content-fade-in-complete', fadeIn);
    return () => window.removeEventListener('home-content-fade-in-complete', fadeIn);
  }, [pathname]);

  return <Header ref={ref} />;
};