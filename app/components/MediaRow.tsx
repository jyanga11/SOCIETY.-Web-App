'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LayeredTile, { MediaItem } from './LayeredTile'; // Adjust path if necessary

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

  const tileWidths = variant === 'portrait' 
    ? 'w-[170px] md:w-[240px] max-w-full' 
    : 'w-[280px] md:w-[380px] max-w-full';

  const imageAspect = variant === 'portrait' ? 'aspect-[3/4]' : 'aspect-[16/9]';

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
          className="flex items-start space-x-6 overflow-x-scroll scrollbar-none px-4 md:px-0 pt-6 pb-10"
          style={{ scrollbarWidth: 'none' }}
        >
          {items.map((item) => (
            <LayeredTile 
              key={item.id} 
              item={item} 
              tileWidths={tileWidths} 
              imageAspect={imageAspect}
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