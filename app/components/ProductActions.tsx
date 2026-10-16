'use client'

import { useCallback, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'

// Call loadStripe outside the component so it isn't recreated on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const SIZES = ['S', 'M', 'L', 'XL'] as const
type Size = (typeof SIZES)[number]

type Props = {
  productId: string
  title: string
  price: number
}

export default function ProductActions({ productId, title, price }: Props) {
  const [size, setSize] = useState<Size | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, size }),
    })
    const { clientSecret } = await res.json()
    return clientSecret as string
  }, [productId, size])

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
        onClick={() => setCheckoutOpen(true)}
        disabled={!size}
        className="rounded-full border-2 border-orange-500 bg-transparent px-6 py-3 text-sm font-medium uppercase text-orange-500 transition hover:bg-orange-500 hover:text-purple-700 opacity-99 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-orange-500"
      >
        {size ? 'Checkout' : 'Select a size'}
      </button>
      {checkoutOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4"
          onClick={() => setCheckoutOpen(false)}
        >
          <div
            className="relative my-8 w-full max-w-lg rounded-2xl bg-black/60 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setCheckoutOpen(false)}
              className="mb-2 ml-auto block text-sm text-gray-600 hover:text-black"
            >
              Close
            </button>
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      )}
    </div>
  )
}