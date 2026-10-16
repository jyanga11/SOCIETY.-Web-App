'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export type Slide = { src: string; alt: string }

export default function ImageCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0)
  const count = slides.length

  if (count === 0) return null

  const prev = () => setIndex((i) => (i - 1 + count) % count)
  const next = () => setIndex((i) => (i + 1) % count)

  return (
    <div
      className="flex max-w-md items-center gap-3"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') prev()
        if (e.key === 'ArrowRight') next()
      }}
      tabIndex={0}
    >
      {count > 1 && (
        <ChevronLeft type="button" onClick={prev} aria-label="Previous image" className="opacity-99 hover:text-orange-500 transition-colors duration-200" />
      )}

      <div className="relative aspect-[4/5] flex-1 overflow-hidden bg-black/5">
        <Image
          key={slides[index].src}
          src={slides[index].src}
          alt={slides[index].alt}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 400px, 100vw"
          className="object-cover"
        />

        {count > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            {index + 1} / {count}
          </div>
        )}
      </div>

      {count > 1 && (
        <ChevronRight type="button" onClick={next} aria-label="Next image" className="opacity-99 hover:text-orange-500 transition-colors duration-200" />
      )}
    </div>
  )
}