'use client';

import React from 'react';
import LayeredTile, { ServiceItem } from './LayeredTile'; // Adjust path if necessary

interface ServicesGridProps {
  items: ServiceItem[];
  variant?: 'landscape' | 'portrait';
}

export default function ServicesGrid({ items, variant = 'landscape' }: ServicesGridProps) {
  // We drop the fixed pixel widths used in the carousel track 
  // and let the grid dictate the width (`w-full`)
  const tileWidths = 'w-full';

  // Explicitly apply the aspect ratio helper to match your design system
  const imageAspect = variant === 'portrait' ? 'aspect-[3/4]' : 'aspect-[16/9]';

  return (
    <div className="w-full px-4 md:px-0 py-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-12">
        {items.map((item) => (
          <LayeredTile
            key={item.id}
            item={item}
            tileWidths={tileWidths}
            imageAspect={imageAspect}
          />
        ))}
      </div>
    </div>
  );
}