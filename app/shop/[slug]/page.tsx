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

type ProductDetail = {
  _id: string
  title: string
  slug: { current: string }
  description?: string
  category: string
  price: number
  coverImage: {
    asset: { _ref: string; _type: string }
    alt?: string
  }
  gallery?: GalleryImage[]
}

const PRODUCT_QUERY = `*[_type == "product" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  description,
  category,
  price,
  coverImage,
  gallery[]{
    _type,
    alt,
    asset
  }
}`

export const revalidate = 60

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await client.fetch<ProductDetail | null>(PRODUCT_QUERY, { slug })

  if (!product) {
    notFound()
  }

  const coverUrl = urlFor(product.coverImage).width(1200).height(1500).fit('crop').url()

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/shop" className="text-sm opacity-70 hover:opacity-100">
        ← Back to shop
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
          <Image
            src={coverUrl}
            alt={product.coverImage.alt ?? product.title}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold sm:text-4xl">{product.title}</h1>
          <p className="text-xl opacity-80">${product.price.toFixed(2)}</p>
          {product.description && <p className="text-base opacity-80">{product.description}</p>}
        </div>
      </div>

      {product.gallery && product.gallery.length > 0 && (
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {product.gallery.map((item, index) => {
            const imageUrl = urlFor(item).width(600).height(750).fit('crop').url()

            return (
              <div key={`${item.asset._ref}-${index}`} className="relative aspect-[4/5] overflow-hidden bg-black/5">
                <Image
                  src={imageUrl}
                  alt={item.alt ?? `${product.title} gallery image ${index + 1}`}
                  fill
                  sizes="(min-width: 640px) 33vw, 50vw"
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
