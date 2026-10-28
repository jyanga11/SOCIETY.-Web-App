import ImageCarousel from '@/app/components/ImageCarousel'
import ProductActions, { type AvailableItem } from '@/app/components/ProductActions'
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

type DropItem = {
  id: number
  product_id: string
  size: string | null
  variant_name: string | null
  unit_amount: number
  currency: string
}

type Drop = {
  id: number
  status: string
  opens_at: string
  closes_at: string
  items: DropItem[]
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

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

function sizeRank(size: string | null) {
  const i = SIZE_ORDER.indexOf((size ?? '').toUpperCase())
  return i === -1 ? SIZE_ORDER.length : i
}

// items in drops that are open right now
// The checkout route re-checks so a stale page can't oversell
async function getAvailableItems(productId: string): Promise<DropItem[]> {
  try {
    const res = await fetch(`${process.env.FASTAPI_URL}/drops?status=open`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return []

    const drops: Drop[] = await res.json()
    const now = Date.now()

    return drops
      .filter(
        (d) => new Date(d.opens_at).getTime() <= now && now < new Date(d.closes_at).getTime(),
      )
      .flatMap((d) => d.items)
      .filter((item) => item.product_id === productId)
      .sort((a, b) => sizeRank(a.size) - sizeRank(b.size) || a.id - b.id)
  } catch (err) {
    console.error('Could not load drop items', err)
    return []
  }
}

export const revalidate = 60

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await client.fetch<ProductDetail | null>(PRODUCT_QUERY, { slug })

  if (!product) {
    notFound()
  }

  const items = await getAvailableItems(product._id)

  // Show the price that will actually be charged (the drop's price), not the
  // Sanity default. If sizes are priced differently, show "from".
  const amounts = items.map((i) => i.unit_amount)
  const lowest = amounts.length > 0 ? Math.min(...amounts) : null
  const varies = amounts.length > 0 && new Set(amounts).size > 1
  const priceLabel =
    lowest !== null
      ? `${varies ? 'From ' : ''}$${(lowest / 100).toFixed(0)}`
      : `$${product.price.toFixed(0)}`

  const availableItems: AvailableItem[] = items.map((i) => ({
    id: i.id,
    size: i.size,
    variant_name: i.variant_name,
  }))

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
          <p className="text-xl opacity-80">{priceLabel}</p>
          <ProductActions items={availableItems} />
        </div>
      </div>
    </main>
  )
}