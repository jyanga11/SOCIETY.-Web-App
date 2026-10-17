import ImageCarousel from '@/app/components/ImageCarousel'
import ProductActions from '@/app/components/ProductActions'
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

  const slides = [
    {
      src: urlFor(product.coverImage).width(1200).height(1500).fit('crop').url(),
      alt: product.coverImage.alt ?? product.title,
    },
    ...(product.gallery ?? []).map((item, i) => ({
      src: urlFor(item).width(1200).height(1500).fit('crop').url(),
      alt: item.alt ?? `${product.title} gallery image ${i + 1}`,
    })),
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/shop" className="text-sm opacity-70 hover:opacity-99">
        ← Back to Shop
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-20 lg:grid-cols-2">
        <ImageCarousel slides={slides} />
        <div className="flex flex-col items-end gap-4 text-right">
          <h1 className="text-3xl font-semibold sm:text-4xl opacity-99">{product.title}</h1>
          {product.description && <p className="text-xl opacity-80">{product.description}</p>}
          <p className="text-xl opacity-80">${product.price.toFixed(0)}</p>
          <ProductActions productId={product._id} title={product.title} price={product.price} />
        </div>
      </div>
    </main>
  )
}
