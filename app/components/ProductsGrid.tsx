'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { urlFor } from '@/sanity/lib/image'

// Sales status of the product's drop excluding drafts and cancelled drops
export type ProductStatus = 'scheduled' | 'open' | 'closed'

export type Product = {
  _id: string
  title: string
  slug: { current: string }
  description?: string
  category: string
  price: number
  status: ProductStatus
  coverImage: {
    asset: { _ref: string; _type: string }
    alt?: string
  }
}

const STATUS_LABELS: Record<ProductStatus, string> = {
  open: 'On Sale',
  scheduled: 'Upcoming',
  closed: 'Closed',
}

const STATUS_ORDER: ProductStatus[] = ['open', 'scheduled', 'closed']

export default function ProductsGrid({ products }: { products: Product[] }) {
  products = [];
  const [activeStatus, setActiveStatus] = useState<ProductStatus | null>(null)

  // Only offer filters for statuses that actually have products.
  const filters = useMemo(() => {
    const present = new Set(products.map((p) => p.status))
    return [
      { value: null as ProductStatus | null, label: 'All' },
      ...STATUS_ORDER.filter((s) => present.has(s)).map((s) => ({
        value: s as ProductStatus | null,
        label: STATUS_LABELS[s],
      })),
    ]
  }, [products])

  const filteredProducts = useMemo(
    () => (activeStatus ? products.filter((p) => p.status === activeStatus) : products),
    [products, activeStatus],
  )

  if (products.length === 0) {
    return (
      <div className="space-y-2 relative group mb-15 md:-ml-4">
        <div className="px-4 pt-6 pb-10 md:px-12">
          <div className="px-6 py-12 text-center">
            <p className="text-2xl sm:text-4xl opacity-60">Stay tuned - more products coming soon. </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div
        className="flex gap-2 overflow-x-auto whitespace-nowrap px-4 -mx-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center sm:overflow-visible sm:whitespace-normal sm:mx-0 sm:px-0"
        role="group"
        aria-label="Filter products by status"
      >
        {filters.map(({ value, label }) => (
          <FilterPill
            key={value ?? 'all'}
            label={label}
            active={activeStatus === value}
            onClick={() => setActiveStatus(value)}
          />
        ))}
      </div>
      <div className="mt-8 grid gap-x-6 gap-y-10 grid-cols-2 sm:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
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

function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.coverImage
    ? urlFor(product.coverImage).width(800).height(1000).fit('crop').url()
    : undefined

  return (
    <Link href={`/shop/${product.slug.current}`} className="group block hover:text-orange-500 transition-colors duration-200">
      <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={product.coverImage.alt ?? product.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h2 className="text-base sm:text-xl text-md">{product.title}</h2>
      </div>
    </Link>
  )
}