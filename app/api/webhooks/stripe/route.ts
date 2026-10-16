import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
    const body = await req.text() // raw body is required for signature verification
    const sig = req.headers.get('stripe-signature')!
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      // session.metadata.productId / size -> mark order paid, decrement stock, send email 
    }
    return new Response(null, { status: 200 })
  }