'use client';

import React, { ComponentType } from 'react';
import { LucideProps } from 'lucide-react';
import Link from 'next/link';

interface ServiceItem {
    id: string | number;
    title: string;
    image: ComponentType<LucideProps>;
    desc: string;
  }
interface ServicesGridProps {
  items: ServiceItem[];
  variant?: 'landscape' | 'portrait';
}

interface ServiceTileProps {
    item: ServiceItem;
    tileWidths: string;
    imageAspect: string;
}
  
function ServiceTile({
    item,
    tileWidths,
    imageAspect,
} : ServiceTileProps) {
    const Icon = item.image;
    return (
      <Link href={`services/${item.id}`}>
        <div className={`${tileWidths} group overflow-hidden`}>
            <div className={`${imageAspect} relative border-6 border-orange-500 rounded-xl`}>
            {/* Icon — shown by default, hidden on hover */}
            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0">
                <Icon size={48} className="text-orange-500" />
            </div>
            {/* Desc — hidden by default, shown on hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-orange-500 px-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="text-purple-700 text-lg text-center font-medium">{item.desc}</p>
            </div>
            </div>
            <div className="px-3 py-2">
            <h3 className="text-lg">{item.title}</h3>
            </div>
        </div>
      </Link>
    );
}

export default function ServicesGrid({ items, variant = 'landscape' }: ServicesGridProps) {
  const tileWidths = 'w-full';
  const imageAspect = variant === 'portrait' ? 'aspect-[3/4]' : 'aspect-[16/9]';

  return (
    <div className="w-full px-4 md:px-0 py-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
      {items.map((item) => (
        <ServiceTile
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