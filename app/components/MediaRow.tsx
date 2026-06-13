'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Install lucide-react for clean icons

interface MediaItem {
  id: string | number;
  title: string;
  image: string;
}

interface MediaRowProps {
  title: string;
  items: MediaItem[];
  variant?: 'landscape' | 'portrait'; // New parameter for tile orientation
}

export default function MediaRow({ title, items, variant = 'landscape' }: MediaRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Check scroll position to dynamically show/hide navigation arrows
  const updateArrows = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      // Give a tiny 2px buffer for rounding errors
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

  useEffect(() => {
    const row = rowRef.current;
    if (row) {
      row.addEventListener('scroll', updateArrows);
      // Initial check on mount
      updateArrows();
    }
    return () => row?.removeEventListener('scroll', updateArrows);
  }, [items]);

  // Scroll handler moving the container by 80% of its visible width
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

  // Dynamic dimension classes based on the variant
  const tileDimensions = variant === 'portrait' 
    ? 'aspect-[3/4] md:max-w-3xs max-w-[170px]' // Vertically tall (similar to Netflix posters)
    : 'aspect-[16/9] md:max-w-sm max-w-2xs'; // Horizontally long (standard landscape)

  return (
    <div className="space-y-2 relative group mt-15 mb-15 md:-ml-4">
      {/* Row Title */}
      <h2 className="md:text-lg text-2xl font-arts-crafts-regular text-[#e5e5e5] transition duration-200 hover:text-white md:text-4xl pl-4 md:pl-12">
        {title}
      </h2>

      {/* Row Container */}
      <div className="relative md:px-12">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute top-0 bottom-0 left-0 z-40 m-auto h-full w-12 cursor-pointer bg-black/50 opacity-0 transition hover:scale-125 group-hover:opacity-100 flex items-center justify-center text-white"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}

        {/* The Scrollable Track */}
        <div
          ref={rowRef}
          className="flex items-start space-x-2 overflow-x-scroll scrollbar-none px-4 md:px-0 py-4"
          style={{ scrollbarWidth: 'none' }} // Firefox fallback to hide scrollbar
        >
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col space-y-2 cursor-pointer transition duration-200 ease-out md:hover:scale-105 flex-shrink-0 ${tileDimensions}`}
            >
              {/* Media Tile Image Container */}
              <div className="h-full w-full rounded-sm overflow-hidden bg-zinc-800">
                <img
                  src={item.image}
                  alt={item.title}
                  className="object-cover h-full w-full"
                  loading="lazy"
                />
              </div>

              {/* Title Beneath the Tile */}
              <div className="px-1">
                <p className="text-[#e5e5e5] hover:text-white text-lg md:text-2xl line-clamp-1 transition-colors duration-200">
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute top-0 bottom-0 right-0 z-40 m-auto h-full w-12 cursor-pointer bg-black/50 opacity-0 transition hover:scale-125 group-hover:opacity-100 flex items-center justify-center text-white"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        )}
      </div>
    </div>
  );
}