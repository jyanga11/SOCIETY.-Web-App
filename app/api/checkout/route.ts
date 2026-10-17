import { NextResponse } from 'next/server'
import { getProduct } from '@/sanity/lib/queries'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const SIZES = ['S', 'M', 'L', 'XL']

export async function POST(req: Request) {
  const { productId, size } = await req.json()

  const product = await getProduct(productId) // Look up in Sanity CMS
  if (!product || !SIZES.includes(size)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded_page',
        mode: 'payment',
        line_items: [
        {
            quantity: 1,
            price_data: {
            currency: 'usd',
            unit_amount: Math.round(product.price * 100), // cents
            product_data: { name: `${product.title} (${size})` },
            },
        },
        ],
        metadata: { productId, size },
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    })

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (err) {
    console.error('Stripe session error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}