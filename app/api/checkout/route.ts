import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import type { EcommerceDetails } from '@/lib/analytics'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const MAX_QUANTITY = 10

type DropItem = {
  id: number
  drop_id: number
  product_name: string
  variant_name: string | null
  size: string | null
  unit_amount: number // minor units (cents)
  currency: string
}

export async function POST(req: Request) {
  let body: { dropItemId?: unknown; quantity?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  
  const dropItemId = Number(body.dropItemId)
  const quantity = body.quantity === undefined ? 1 : Number(body.quantity)

  if (!Number.isInteger(dropItemId) || dropItemId <= 0) {
    return NextResponse.json({ error: 'Invalid item' }, { status: 400 })
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 })
  }

  // Price, name and size always come from our database, never from the browser.
  // This endpoint also checks that the drop is open and inside its sale window.
  let item: DropItem
  try {
    const itemRes = await fetch(
      `${process.env.FASTAPI_URL}/drops/items/${dropItemId}`,
      { cache: 'no-store' },
    )

    if (!itemRes.ok) {
      const detail = (await itemRes.json().catch(() => null))?.detail
      const message =
        typeof detail === 'string' ? detail : 'This item is not available.'
      return NextResponse.json(
        { error: message },
        { status: itemRes.status === 404 ? 404 : 409 },
      )
    }

    item = await itemRes.json()
  } catch (err) {
    console.error('Could not load drop item', dropItemId, err)
    return NextResponse.json(
      { error: 'Could not start checkout. Please try again.' },
      { status: 500 },
    )
  }

  const currency = item.currency.toLowerCase()
  // Use the same catalog name as item_id on the product detail page.
  const itemId = item.product_name
  const variant = [item.variant_name, item.size].filter(Boolean).join(' · ')
  const price = item.unit_amount / 100
  const checkoutAnalytics: EcommerceDetails = {
    currency: currency.toUpperCase(),
    value: (item.unit_amount * quantity) / 100,
    items: [{
      item_id: itemId,
      item_name: item.product_name,
      ...(variant ? { item_variant: variant } : {}),
      price,
      quantity,
    }],
  }

  const displayName = [item.product_name, item.variant_name, item.size]
    .filter(Boolean)
    .join(' · ')

  const internalApiToken = process.env.INTERNAL_API_TOKEN

  if (!internalApiToken?.trim()) {
    console.error('Checkout configuration error: INTERNAL_API_TOKEN is missing')
    return NextResponse.json(
      { error: 'Could not start checkout. Please try again.' },
      { status: 503 },
    )
  }

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      mode: 'payment',
      line_items: [
        {
          quantity,
          price_data: {
            currency,
            unit_amount: item.unit_amount,
            product_data: {
              name: displayName,
              metadata: {
                analytics_item_id: itemId,
                analytics_item_name: item.product_name,
                ...(variant ? { analytics_item_variant: variant } : {}),
              },
            },
          },
        },
      ],
      customer_creation: "always",
      consent_collection: {promotions: "auto"},
      shipping_address_collection: { allowed_countries: ['US'] },
      phone_number_collection: {"enabled": true},
      billing_address_collection: "required",
      metadata: { drop_item_id: String(item.id) },
      payment_intent_data: { metadata: { drop_item_id: String(item.id) } },
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    })

    // Save with FastAPI before returning to the frontend. The backend builds the
    // order from the DropItem, so we only send which item and how many.
    try {
      const response = await fetch(`${process.env.FASTAPI_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${internalApiToken}`,
        },
        body: JSON.stringify({
          stripe_session_id: session.id,
          drop_item_id: item.id,
          quantity,
        }),
      })

      if (!response.ok) {
        const errorDetail = await response.text()
        throw new Error(`Could not persist order (${response.status}): ${errorDetail}`)
      }
    } catch (err) {
      // Rollback: if FastAPI fails to save the order, expire the Stripe session
      // so the user can't complete an untracked checkout.
      await stripe.checkout.sessions
        .expire(session.id)
        .catch((e) => console.error('Failed to expire orphaned session', session.id, e))
      throw err
    }

    return NextResponse.json({
      clientSecret: session.client_secret,
      checkoutAnalytics,
    })
  } catch (err) {
    // Log the details, but don't leak internals to the browser.
    console.error('Checkout session error:', err)
    return NextResponse.json(
      { error: 'Could not start checkout. Please try again.' },
      { status: 500 },
    )
  }
}