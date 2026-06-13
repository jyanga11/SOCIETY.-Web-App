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
}

export default function MediaRow({ title, items }: MediaRowProps) {
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

  return (
    <div className="space-y-2 relative group mt-15 mb-15 md:-ml-4">
      {/* Row Title */}
      <h2 className="text-lg font-arts-crafts-regular text-[#e5e5e5] transition duration-200 hover:text-white md:text-4xl pl-4 md:pl-12">
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
          className="flex items-center space-x-2 overflow-x-scroll scrollbar-none px-4 md:px-0"
          style={{ scrollbarWidth: 'none' }} // Firefox fallback to hide scrollbar
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="relative h-28 min-w-[180px] cursor-pointer transition duration-200 ease-out md:h-36 md:min-w-[260px] md:hover:scale-105 rounded-sm overflow-hidden bg-zinc-800 flex-shrink-0"
            >
              <img
                src={item.image}
                alt={item.title}
                className="rounded-sm object-cover h-full w-full"
                loading="lazy"
              />
              {/* Optional Title Overlay on Hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                <p className="text-white text-xs md:text-sm font-medium">{item.title}</p>
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