import Link from 'next/link'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function formatMoney(amount: number | null, currency: string | null) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency ?? 'usd',
  }).format((amount ?? 0) / 100)
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border-2 border-orange-500 p-8 z-70">
        {children}
      </div>
    </main>
  )
}

function Message({
  title,
  body,
  cta,
}: {
  title: string
  body: string
  cta: { href: string; label: string }
}) {
  return (
    <Shell>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 opacity-70">{body}</p>
      <Link
        href={cta.href}
        className="mt-6 inline-block rounded-full border-2 border-orange-500 px-6 py-3 text-sm font-medium uppercase transition hover:bg-orange-500"
      >
        {cta.label}
      </Link>
    </Shell>
  )
}

export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  if (!session_id) {
    return (
      <Message
        title="Nothing to show here"
        body="We couldn't find an order to display."
        cta={{ href: '/', label: 'Back to shop' }}
      />
    )
  }

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items'],
    })
  } catch {
    return (
      <Message
        title="We couldn't find that order"
        body="The link may be invalid or expired. If you were charged, contact us and we'll sort it out."
        cta={{ href: '/', label: 'Back to shop' }}
      />
    )
  }

  if (session.status !== 'complete') {
    return (
      <Message
        title="Payment not completed"
        body="Your payment didn't go through and you haven't been charged. You can try again any time."
        cta={{ href: '/', label: 'Back to shop' }}
      />
    )
  }

  const email = session.customer_details?.email
  const name = session.customer_details?.name
  const items = session.line_items?.data ?? []
  const orderRef = session.id.slice(-8).toUpperCase()

  return (
    <Shell>
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-orange-500">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
            aria-hidden="true"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-semibold">
          {name ? `Thank you, ${name.split(' ')[0]}!` : 'Thank you for your order!'}
        </h1>
        <p className="mt-2 opacity-70">
          Your payment was successful.
          {email && (
            <>
              {' '}A confirmation will be sent to{' '}
              <span className="font-medium opacity-100">{email}</span>.
            </>
          )}
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-orange-500/40 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="opacity-70">Order reference</span>
          <span className="font-medium">{orderRef}</span>
        </div>

        <ul className="mt-4 divide-y divide-orange-500/40 border-t border-orange-500/40">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-3 text-sm">
              <div>
                <p className="font-medium">{item.description}</p>
                <p className="opacity-70">Qty {item.quantity}</p>
              </div>
              <p>{formatMoney(item.amount_total, session.currency)}</p>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-orange-500/40 pt-4">
          <span className="font-medium">Total paid</span>
          <span className="text-lg font-semibold">
            {formatMoney(session.amount_total, session.currency)}
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/shop/"
          className="rounded-full border-2 border-orange-500 bg-orange-500 px-6 py-3 text-center text-sm font-medium uppercase transition hover:bg-transparent"
        >
          Continue shopping
        </Link>
      </div>

      <p className="mt-6 text-center text-xs opacity-70">
        Questions about your order? Reply to your confirmation email and include
        reference {orderRef}.
      </p>
    </Shell>
  )
}