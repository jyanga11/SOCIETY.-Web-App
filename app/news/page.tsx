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
    <main className="relative z-20 mx-auto md:px-30 px-5 py-12">
      <div className="m-2 sm:m-10">
        <div className="py-10 flex flex-col gap-6">
          <h1 className="text-3xl sm:text-7xl font-arts-crafts-regular">News</h1>
        </div>
        <NewsList news={news} />
      </div>
    </main>
  )
}