'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;   // seconds, for staggering multiple items
  y?: number;        // px to slide up from
  duration?: number; // seconds
  once?: boolean;    // only animate the first time it enters view
};

export const FadeIn = ({
  children,
  className,
  delay = 0,
  y = 24,
  duration = 0.6,
  once = true,
}: FadeInProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%', // fires when element top hits 85% down the viewport
            toggleActions: once
              ? 'play none none none'
              : 'play none none reverse',
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [delay, duration, y, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};