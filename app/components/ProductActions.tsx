'use client'

import { useState } from 'react'

const SIZES = ['S', 'M', 'L', 'XL'] as const
type Size = (typeof SIZES)[number]

type Props = {
  productId: string
  title: string
  price: number
}

export default function ProductActions({ productId, title, price }: Props) {
  const [size, setSize] = useState<Size | null>(null)

  const addToCart = () => {
    if (!size) return
    // TODO: replace with your real cart logic (context, Zustand, Shopify, Stripe, etc.)
    console.log('Add to cart:', { productId, title, price, size })
  }

  return (
    <div className="flex w-full flex-col items-end gap-4">
      <div className="flex gap-2" role="radiogroup" aria-label="Size">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={size === s}
            onClick={() => setSize(s)}
            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 opacity-99 border-orange-500 text-sm font-medium transition ${
              size === s
                ? 'bg-orange-500 text-purple-700'
                : 'bg-transparent text-orange-500 hover:border-purple-700 hover:text-purple-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={addToCart}
        disabled={!size}
        className="rounded-full border-2 border-orange-500 bg-transparent px-6 py-3 text-sm font-medium uppercase text-orange-500 transition hover:bg-orange-500 hover:text-purple-700 opacity-99 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-orange-500"
      >
        {size ? 'Add to cart' : 'Select a size'}
      </button>
    </div>
  )
}