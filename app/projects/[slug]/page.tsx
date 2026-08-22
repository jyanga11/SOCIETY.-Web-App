import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'

type GalleryImage = {
  _type: 'image'
  alt?: string
  asset: { _ref: string; _type: string }
}

type ProjectDetail = {
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
  gallery?: GalleryImage[]
}

const CATEGORY_LABELS: Record<string, string> = {
  'album/single': 'Album/Single',
  'music video': 'Music Video',
  film: 'Film',
  photography: 'Photography',
  artwork: 'Artwork',
  clothing: 'Clothing',
}

const PROJECT_QUERY = `*[_type == "project" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  description,
  category,
  uploadDate,
  coverImage,
  gallery[]{
    _type,
    alt,
    asset
  }
}`

export const revalidate = 60

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await client.fetch<ProjectDetail | null>(PROJECT_QUERY, { slug })

  if (!project) {
    notFound()
  }

  const coverUrl = urlFor(project.coverImage).width(1200).height(675).fit('crop').url()
  const galleryImages = project.gallery?.filter((item): item is GalleryImage => item._type === 'image') ?? []

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/projects" className="text-sm opacity-70 hover:opacity-100">
        ← Back to projects
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="relative aspect-[16/9] overflow-hidden bg-black/5">
          <Image
            src={coverUrl}
            alt={project.coverImage.alt ?? project.title}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold sm:text-4xl">{project.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm opacity-70">
            <span>{CATEGORY_LABELS[project.category] ?? project.category}</span>
            {project.uploadDate && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={project.uploadDate}>
                  {new Date(project.uploadDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </>
            )}
          </div>
          {project.description && <p className="text-base opacity-80">{project.description}</p>}
        </div>
      </div>

      {galleryImages.length > 0 && (
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {galleryImages.map((item, index) => {
            const imageUrl = urlFor(item).width(800).height(450).fit('crop').url()

            return (
              <div key={`${item.asset._ref}-${index}`} className="relative aspect-[16/9] overflow-hidden bg-black/5">
                <Image
                  src={imageUrl}
                  alt={item.alt ?? `${project.title} gallery image ${index + 1}`}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
