'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { urlFor } from '@/sanity/lib/image'

export type Project = {
  _id: string
  title: string
  slug: { current: string }
  description?: string
  category: string
  uploadDate?: string
  coverImage: {
    asset: { _ref: string; _type: string }
    alt?: string
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  'album/single': 'Album/Single',
  'music video': 'Music Video',
  film: 'Film',
  photography: 'Photography',
  artwork: 'Artwork',
  clothing: 'Clothing',
}

const FILTERS: { value: string | null; label: string }[] = [
  { value: null, label: 'All' },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
]

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredProjects = useMemo(
    () => (activeCategory ? projects.filter((p) => p.category === activeCategory) : projects),
    [projects, activeCategory],
  )

  if (projects.length === 0) {
    return null
  }

  return (
    <div className="mt-10">
      <div
        className="flex gap-2 overflow-x-auto whitespace-nowrap px-4 -mx-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center sm:overflow-visible sm:whitespace-normal sm:mx-0 sm:px-0"
        role="group"
        aria-label="Filter projects by category"
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
        <div className="mt-8 grid gap-x-6 gap-y-10 grid-cols-2 sm:grid-cols-3">
            {filteredProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
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
      className={`text-xl mx-2 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${
        active ? 'font-medium opacity-100' : 'opacity-50 hover:opacity-80'
      }`}
    >
      {label}
    </button>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const imageUrl = project.coverImage
    ? urlFor(project.coverImage).width(800).height(450).fit('crop').url()
    : undefined

  return (
    <Link href={`/projects/${project.slug.current}`} className="group block">
      <div className="relative aspect-[16/9] overflow-hidden bg-black/5">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={project.coverImage.alt ?? project.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h2 className="text-base font-medium">{project.title}</h2>
      </div>
    </Link>
  )
}
