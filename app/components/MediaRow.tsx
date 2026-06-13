'use client';

import React, { useRef, useState, useEffect, MouseEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface MediaItem {
  id: string | number;
  title: string;
  image: string;
}

interface MediaRowProps {
  items: MediaItem[];
  variant?: 'landscape' | 'portrait';
}

export default function MediaRow({ items, variant = 'landscape' }: MediaRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const updateArrows = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

  useEffect(() => {
    const row = rowRef.current;
    if (row) {
      row.addEventListener('scroll', updateArrows);
      updateArrows();
    }
    return () => row?.removeEventListener('scroll', updateArrows);
  }, [items]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { clientWidth, scrollLeft } = rowRef.current;
      const scrollAmount = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;

      rowRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const tileDimensions = variant === 'portrait' 
    ? 'aspect-[3/4] md:max-w-3xs max-w-[170px]' 
    : 'aspect-[16/9] md:max-w-sm max-w-2xs';

  return (
    <div className="space-y-2 relative group mb-15 md:-ml-4">
      <div className="relative md:px-12">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute top-0 bottom-0 left-0 z-50 m-auto h-full w-12 cursor-pointer bg-black/50 opacity-0 transition hover:scale-125 group-hover:opacity-100 flex items-center justify-center text-white"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}

        {/* The Scrollable Track */}
        <div
          ref={rowRef}
          className="flex items-start space-x-6 overflow-x-scroll scrollbar-none px-4 md:px-0 py-6"
          style={{ scrollbarWidth: 'none' }}
        >
          {items.map((item) => (
            <LayeredTile 
              key={item.id} 
              item={item} 
              tileDimensions={tileDimensions} 
            />
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute top-0 bottom-0 right-0 z-50 m-auto h-full w-12 cursor-pointer bg-black/50 opacity-0 transition hover:scale-125 group-hover:opacity-100 flex items-center justify-center text-white"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        )}
      </div>
    </div>
  );
}

// --- Subcomponent with permanent layered offsets that activate on hover ---
function LayeredTile({ item, tileDimensions }: { item: MediaItem; tileDimensions: string }) {
  // 1. Initialize motion values with the default static offsets (e.g., 12px, 8px, 4px)
  // This prevents the layers from snapping to center before the mouse moves.
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 170 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  // 2. Map ranges for the fluid motion when tracked
  const purpleX = useTransform(mouseX, [-150, 150], [-12, 12]);
  const purpleY = useTransform(mouseY, [-150, 150], [-12, 12]);

  const fuchsiaX = useTransform(mouseX, [-150, 150], [-9, 9]);
  const fuchsiaY = useTransform(mouseY, [-150, 150], [-9, 9]);

  const orangeX = useTransform(mouseX, [-150, 150], [-5, 5]);
  const orangeY = useTransform(mouseY, [-150, 150], [-5, 5]);

  const yellowX = useTransform(mouseX, [-150, 150], [-3, 3]);
  const yellowY = useTransform(mouseY, [-150, 150], [-3, 3]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseXPos = e.clientX - rect.left - rect.width / 2;
    const mouseYPos = e.clientY - rect.top - rect.height / 2;

    x.set(mouseXPos);
    y.set(mouseYPos);
  };

  const handleMouseLeave = () => {
    // Smoothly spring right back to the static resting position
    x.set(0);
    y.set(0);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`flex flex-col space-y-4 cursor-pointer flex-shrink-0 relative group/tile ${tileDimensions}`}
    >
      {/* Media Tile Image Stack Container */}
      <div className="relative h-full w-full select-none items-center justify-center flex">
        
        {/* Purple Layer - Permanently visible */}
        <motion.div
          style={{ x: purpleX, y: purpleY }}
          className="absolute inset-0 rounded-sm overflow-hidden bg-purple-900 translate-x-4 translate-y-4 pointer-events-none"
        >
          <div 
            className="object-cover h-full w-full mix-blend-multiply" 
          />
        </motion.div>

        {/* Fuchsia Layer - Permanently visible */}
        <motion.div
          style={{ x: fuchsiaX, y: fuchsiaY }}
          className="absolute inset-0 rounded-sm overflow-hidden bg-fuchsia-700 translate-x-3 translate-y-3 pointer-events-none"
        >
          <div 
            className="object-cover h-full w-full mix-blend-multiply" 
          />
        </motion.div>

        {/* Orange Layer (Deepest Offset) - Permanently visible via translate utilities */}
        <motion.div
          style={{ x: orangeX, y: orangeY }}
          className="absolute inset-0 rounded-sm overflow-hidden bg-orange-500 translate-x-2 translate-y-2 pointer-events-none"
        >
          <div 
            className="object-cover h-full w-full mix-blend-multiply" 
          />
        </motion.div>

        {/* Yellow Layer (Deepest Offset) - Permanently visible via translate utilities */}
        <motion.div
          style={{ x: yellowX, y: yellowY }}
          className="absolute inset-0 rounded-sm overflow-hidden bg-yellow-500 translate-x-1 translate-y-1 pointer-events-none"
        >
          <div 
            className="object-cover h-full w-full mix-blend-multiply" 
          />
        </motion.div>


        {/* Base/Top Layer (True Visual Anchor) */}
        <div className="relative z-10 h-full w-full rounded-sm overflow-hidden bg-yellow-500 shadow-xl">
          <img
            src={item.image}
            alt={item.title}
            className="object-cover h-full w-full"
            loading="lazy"
          />
        </div>
      </div>

      {/* Title Beneath the Tile */}
      <div className="px-1 z-20">
        <p className="group-hover/tile:text-orange-500 text-lg md:text-2xl line-clamp-1 transition-colors duration-200">
          {item.title}
        </p>
      </div>
    </div>
  );
}