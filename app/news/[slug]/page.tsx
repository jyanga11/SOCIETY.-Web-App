import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { PortableTextBlock } from '@portabletext/types'

import PortableTextContent from '../../components/PortableTextContent'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'

type NewsDetail = {
  _id: string
  title: string
  slug: { current: string }
  category: string
  uploadDate: string
  coverImage: {
    asset: { _ref: string; _type: string }
    alt?: string
  }
  body: PortableTextBlock[]
}

const CATEGORY_LABELS: Record<string, string> = {
  announcements: 'Announcements',
  events: 'Events',
  'behind-the-scenes': 'Behind the Scenes',
  press: 'Press',
  drops: 'Drops',
  educate: 'Educate',
}

const NEWS_QUERY = `*[_type == "blogContent" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  category,
  uploadDate,
  coverImage,
  body
}`

export const revalidate = 60

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await client.fetch<NewsDetail | null>(NEWS_QUERY, { slug })

  if (!article) {
    notFound()
  }

  const coverUrl = urlFor(article.coverImage).width(1200).height(675).fit('crop').url()

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/news" className="text-sm sm:text-lg opacity-70 hover:text-orange-500 transition-colors duration-200">
        ← Back to News
      </Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-3 text-sm sm:text-lg opacity-70">
          <span>{CATEGORY_LABELS[article.category] ?? article.category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={article.uploadDate}>
            {new Date(article.uploadDate).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
        <h1 className="mt-4 text-lg sm:text-xl">{article.title}</h1>
      </header>

      <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-black/5">
        <Image
          src={coverUrl}
          alt={article.coverImage.alt ?? article.title}
          fill
          priority
          sizes="(min-width: 1024px) 896px, 100vw"
          className="object-cover"
        />
      </div>

      <article className="mt-10">
        <PortableTextContent value={article.body} />
      </article>
    </main>
  )
}
