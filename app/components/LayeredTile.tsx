'use client';

import React, { ComponentType, MouseEvent, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { LucideProps } from 'lucide-react';

export interface MediaItem {
  id: string | number;
  title: string;
  image: string;
}

export interface ServiceItem {
  id: string | number;
  title: string;
  image: ComponentType<LucideProps>;
  desc: string;
  tags: Array<string>;
}

interface LayeredTileProps {
  // item can now be either type, allowing this component to remain reusable
  item: MediaItem | ServiceItem;
  tileWidths: string;
  imageAspect: string;
}

export default function LayeredTile({ item, tileWidths, imageAspect }: LayeredTileProps) {
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 170 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  const purpleX = useTransform(mouseX, [-150, 150], [-12, 12]);
  const purpleY = useTransform(mouseY, [-150, 150], [-12, 12]);

  const fuchsiaX = useTransform(mouseX, [-150, 150], [-9, 9]);
  const fuchsiaY = useTransform(mouseY, [-150, 150], [-9, 9]);

  const orangeX = useTransform(mouseX, [-150, 150], [-5, 5]);
  const orangeY = useTransform(mouseY, [-150, 150], [-5, 5]);

  const yellowX = useTransform(mouseX, [-150, 150], [-3, 3]);
  const yellowY = useTransform(mouseY, [-150, 150], [-3, 3]);

  // Helper guard to safely check if item is a ServiceItem
  const isServiceItem = (object: unknown): object is ServiceItem => {
    return typeof object === 'object' && object !== null && 'desc' in object;
  };

  const handleMouseOver = () => {
    setIsHovered(true);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseXPos = e.clientX - rect.left - rect.width / 2;
    const mouseYPos = e.clientY - rect.top - rect.height / 2;

    x.set(mouseXPos);
    y.set(mouseYPos);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      onMouseOver={handleMouseOver}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`flex flex-col space-y-4 cursor-pointer flex-shrink-0 relative group/tile ${tileWidths}`}
    >
      {/* Media Tile Image Stack Container */}
      <div className={`relative w-full select-none items-center justify-center flex ${imageAspect}`}>
        
        {/* Purple Layer */}
        <motion.div
          style={{ x: purpleX, y: purpleY }}
          className="absolute inset-0 rounded-sm overflow-hidden bg-purple-900 translate-x-4 translate-y-4 pointer-events-none"
        >
          <div className="object-cover h-full w-full mix-blend-multiply" />
        </motion.div>

        {/* Fuchsia Layer */}
        <motion.div
          style={{ x: fuchsiaX, y: fuchsiaY }}
          className="absolute inset-0 rounded-sm overflow-hidden bg-fuchsia-700 translate-x-3 translate-y-3 pointer-events-none"
        >
          <div className="object-cover h-full w-full mix-blend-multiply" />
        </motion.div>

        {/* Orange Layer */}
        <motion.div
          style={{ x: orangeX, y: orangeY }}
          className="absolute inset-0 rounded-sm overflow-hidden bg-orange-500 translate-x-2 translate-y-2 pointer-events-none"
        >
          <div className="object-cover h-full w-full mix-blend-multiply" />
        </motion.div>

        {/* Yellow Layer */}
        <motion.div
          style={{ x: yellowX, y: yellowY }}
          className="absolute inset-0 rounded-sm overflow-hidden bg-yellow-500 translate-x-1 translate-y-1 pointer-events-none"
        >
          <div className="object-cover h-full w-full mix-blend-multiply" />
        </motion.div>

        {/* Base/Top Layer (True Visual Anchor) */}
        <div className="relative z-10 h-full w-full rounded-sm overflow-hidden bg-gradient-to-br from-orange-500 to-purple-700 shadow-xl flex items-center justify-center">
          {isHovered && isServiceItem(item) ? (
            <div className='h-full w-full bg-orange-500 p-4 justify-center text-center'>
              <p className="text-sm sm:text-lg leading-relaxed text-center">
                {item.desc}
              </p>
            </div>
          ) : (
            /* Render conditionally based on whether it's a component or an image string */
            (() => {
              if (isServiceItem(item)) {
                const IconComponent = item.image;
                return <IconComponent className="w-12 h-12 text-white stroke-[2.25]" />;
              } else {
                return (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 object-cover h-full w-full"
                    loading="lazy"
                  />
                );
              }
            })()
          )}
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