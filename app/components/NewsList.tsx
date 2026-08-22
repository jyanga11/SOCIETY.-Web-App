'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { urlFor } from '@/sanity/lib/image'

export type NewsItem = {
  _id: string
  title: string
  slug: { current: string }
  category: string
  body: string
  uploadDate?: string
  coverImage?: {
    asset: { _ref: string; _type: string }
    alt?: string
  }
}

const CATEGORY_LABELS: Record<string, string> = {
    announcements: 'Announcements',
    events: 'Events',
    'behind-the-scenes': 'Behind the Scenes',
    press: 'Press',
    drops: 'Drops',
    educate: 'Educate',
}

const FILTERS: { value: string | null; label: string }[] = [
  { value: null, label: 'All' },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
]

export default function NewsList({ news }: { news: NewsItem[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredNews = useMemo(
    () => (activeCategory ? news.filter((n) => n.category === activeCategory) : news),
    [news, activeCategory],
  )

  if (news.length === 0) {
    return null
  }

  return (
    <div className="mt-10">
      <div
        className="flex gap-2 overflow-x-auto whitespace-nowrap px-4 -mx-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center sm:overflow-visible sm:whitespace-normal sm:mx-0 sm:px-0"
        role="group"
        aria-label="Filter news by category"
      >
        {FILTERS.map(({ value, label }) => (
          <FilterPill
            key={value ?? 'all'}
            label={label}
            active={activeCategory === value}
            onClick={() => setActiveCategory(value)}
          />
        ))}
      </div>
      <div className="mt-8 divide-y divide-black/10">
        {filteredNews.map((item) => (
          <NewsRow key={item._id} item={item} />
        ))}
      </div>
    </div>
  )
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-none text-lg sm:text-xl mx-2 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${
        active ? 'font-medium opacity-100' : 'opacity-50 hover:opacity-80'
      }`}
    >
      {label}
    </button>
  )
}

function NewsRow({ item }: { item: NewsItem }) {
  const imageUrl = item.coverImage
    ? urlFor(item.coverImage).width(400).height(225).fit('crop').url()
    : undefined

  return (
    <Link
      href={`/news/${item.slug.current}`}
      className="group flex flex-col items-stretch gap-4 py-8 last:pb-0 border-t-2 sm:flex-row sm:gap-6"
    >
      {imageUrl && (
        <div className="relative aspect-[16/9] w-full flex-none self-center overflow-hidden bg-black/5 sm:w-100">
          <Image
            src={imageUrl}
            alt={item.coverImage?.alt ?? item.title}
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-center justify-between">
            <h2 className=" text-2xl sm:text-5xl font-medium">{item.title}</h2>
            <ArrowRight
                className="size-10 flex-none self-center transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
            />
        </div>
          {item.uploadDate && (
            <span className="text-lg sm:text-xl opacity-60">
              {new Date(item.uploadDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          )}
      </div>
    </Link>
  )
}