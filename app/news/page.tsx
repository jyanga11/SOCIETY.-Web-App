import { client } from '@/sanity/lib/client'

import NewsList, { type NewsItem } from '../components/NewsList'

const NEWS_QUERY = `*[_type == "blogContent"] | order(uploadDate desc){
  _id,
  title,
  slug,
  description,
  category,
  body,
  uploadDate,
  coverImage
}`

// Revalidate periodically so new/edited Studio content shows up without a full redeploy.
export const revalidate = 60

export default async function NewsPage() {
  const news = await client.fetch<NewsItem[]>(NEWS_QUERY)

  return (
    <main className="mx-16 px-4 py-12">
      <h1 className="text-8xl font-semibold py-12 mb-4 font-arts-crafts-regular">News</h1>
      <NewsList news={news} />
    </main>
  )
}