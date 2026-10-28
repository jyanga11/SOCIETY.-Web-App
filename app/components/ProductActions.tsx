'use client'

import { useCallback, useState, type FormEvent } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'

// Call loadStripe outside the component so it isn't recreated on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export type AvailableItem = {
  id: number // DropItem id
  size: string | null
  variant_name: string | null
}

const MIN_QUANTITY = 1
const MAX_QUANTITY = 10

type Props = {
  items: AvailableItem[]
}

export default function ProductActions({ items }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(MIN_QUANTITY)
  const [newsletterOptIn, setNewsletterOptIn] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifyWebsite, setNotifyWebsite] = useState('')
  const [notifyLoading, setNotifyLoading] = useState(false)
  const [notifySuccess, setNotifySuccess] = useState(false)
  const [notifyError, setNotifyError] = useState<string | null>(null)

  const handleNotifySignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (notifyLoading) return
    setNotifyLoading(true)
    setNotifyError(null)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: notifyEmail.trim(), website: notifyWebsite }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to sign up right now. Please try again.')
      }
      setNotifySuccess(true)
      setNotifyEmail('')
    } catch (error) {
      setNotifyError(error instanceof Error ? error.message : 'Unable to sign up.')
    } finally {
      setNotifyLoading(false)
    }
  }

  // Only add the color/option to the label if the sizes alone would be ambiguous.
  const needsVariantLabel = new Set(items.map((i) => i.variant_name ?? '')).size > 1

  const labelFor = (item: AvailableItem) => {
    const size = item.size ?? 'One size'
    return needsVariantLabel && item.variant_name ? `${size} · ${item.variant_name}` : size
  }

  const fetchClientSecret = useCallback(async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dropItemId: selectedId,
          quantity,
          newsletter_opt_in: newsletterOptIn,
        }),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.clientSecret) {
        throw new Error(data?.error ?? 'Could not start checkout. Please try again.')
      }

      return data.clientSecret as string
    } catch (err) {
      setCheckoutError((err as Error).message)
      setCheckoutOpen(false)
      throw err
    }
  }, [selectedId, quantity, newsletterOptIn])

  if (items.length === 0) {
    return (
      <div className="z-99 flex w-full flex-col items-end gap-3">
        {!notifyOpen ? (
          <button
            type="button"
            onClick={() => { setNotifyOpen(true); setNotifyError(null) }}
            className="rounded-full border-2 border-orange-500 bg-transparent px-6 py-3 text-sm font-medium uppercase text-orange-500 transition hover:bg-orange-500 hover:text-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            Notify me about drops
          </button>
        ) : (
          <div className="w-full max-w-sm rounded-2xl border border-orange-500/40 p-4 text-foreground">
            {notifySuccess ? (
              <div role="status" className="space-y-3">
                <p className="text-sm font-medium text-orange-500">You're on the list!</p>
                <p className="text-xs text-muted-foreground">
                  Look out for SOCIETY. newsletter updates and upcoming drops.
                </p>
                <button type="button" onClick={() => { setNotifyOpen(false); setNotifySuccess(false) }} className="text-xs underline underline-offset-4">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleNotifySignup} className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="drop-notify-email" className="text-sm font-medium text-orange-500">
                    Get drop updates
                  </label>
                  <button type="button" onClick={() => setNotifyOpen(false)} className="text-xs text-muted-foreground hover:text-foreground" aria-label="Close signup">
                    Close
                  </button>
                </div>
                <input
                  id="drop-notify-email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={320}
                  placeholder="Email address"
                  value={notifyEmail}
                  onChange={(event) => setNotifyEmail(event.target.value)}
                  className="w-full rounded-full border border-orange-500/60 bg-transparent px-4 py-3 text-sm outline-none focus:border-orange-500"
                />
                {/* Honeypot: invisible to real visitors. */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="drop-notify-website">Website</label>
                  <input
                    id="drop-notify-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={notifyWebsite}
                    onChange={(event) => setNotifyWebsite(event.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  By signing up, you agree to receive the SOCIETY. newsletter, including product-drop announcements. Unsubscribe anytime.
                </p>
                {notifyError && <p role="alert" className="text-xs text-red-500">{notifyError}</p>}
                <button
                  type="submit"
                  disabled={notifyLoading}
                  className="rounded-full border-2 border-orange-500 bg-orange-500 px-5 py-3 text-sm font-medium uppercase text-purple-700 transition hover:bg-transparent hover:text-orange-500 disabled:opacity-50"
                >
                  {notifyLoading ? 'Signing up…' : 'Sign me up'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="z-99 flex w-full flex-col items-end gap-4">
      <div className="flex flex-wrap justify-end gap-2" role="radiogroup" aria-label="Size">
        {items.map((item) => {
          const selected = selectedId === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setSelectedId(item.id)
                setCheckoutError(null)
              }}
              className={`flex h-11 min-w-11 items-center justify-center rounded-full border-2 px-3 opacity-99 border-orange-500 text-sm font-medium transition ${
                selected
                  ? 'bg-orange-500 text-purple-700'
                  : 'bg-transparent text-orange-500 hover:border-purple-700 hover:text-purple-700'
              }`}
            >
              {labelFor(item)}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-3 opacity-99" role="group" aria-label="Quantity">
        <span className="text-sm font-medium uppercase text-orange-500 opacity-99">Qty</span>
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => {
            setQuantity((q) => Math.max(MIN_QUANTITY, q - 1))
            setCheckoutError(null)
          }}
          disabled={quantity <= MIN_QUANTITY}
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-orange-500 text-lg font-medium text-orange-500 opacity-99 transition hover:border-purple-700 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-orange-500 disabled:hover:text-orange-500"
        >
          −
        </button>
        <span
          className="min-w-8 text-center text-sm font-medium text-orange-500 opacity-99"
          aria-live="polite"
        >
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => {
            setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))
            setCheckoutError(null)
          }}
          disabled={quantity >= MAX_QUANTITY}
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-orange-500 text-lg font-medium text-orange-500 opacity-99 transition hover:border-purple-700 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-orange-500 disabled:hover:text-orange-500"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          setCheckoutError(null)
          setCheckoutOpen(true)
        }}
        disabled={selectedId === null}
        className="rounded-full border-2 border-orange-500 bg-transparent px-6 py-3 text-sm font-medium uppercase text-orange-500 transition hover:bg-orange-500 hover:text-purple-700 opacity-99 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-orange-500"
      >
        {selectedId !== null
          ? quantity > 1
            ? `Checkout (${quantity})`
            : 'Checkout'
          : 'Select a size'}
      </button>

      {checkoutError && (
        <p role="alert" className="text-sm text-red-500">
          {checkoutError}
        </p>
      )}

      {checkoutOpen && (
        <div
          className="fixed inset-0 z-50 pt-20 flex items-start justify-center overflow-y-auto bg-black/60 p-4"
          onClick={() => setCheckoutOpen(false)}
        >
          <div
            className="relative my-8 pb-8 w-full max-w-lg rounded-2xl bg-black/60 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setCheckoutOpen(false)}
              className="mb-2 ml-auto block text-sm text-gray-600 hover:text-white"
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