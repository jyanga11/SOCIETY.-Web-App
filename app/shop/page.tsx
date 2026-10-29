import { client } from '@/sanity/lib/client'

import ProductsGrid, { type Product, type ProductStatus } from '../components/ProductsGrid'

type SanityProduct = Omit<Product, 'status'>

type Drop = {
  id: number
  status: string
  opens_at: string
  closes_at: string
  items: { product_id: string }[]
}

const PRODUCTS_QUERY = `*[_type == "product"] | order(title asc){
  _id,
  title,
  slug,
  description,
  category,
  price,
  coverImage
}`

const STATUS_PRIORITY: Record<ProductStatus, number> = { open: 0, scheduled: 1, closed: 2 }

// Draft and cancelled drops are never shown. For the rest, the dates win over
// the stored status so the shop is right even if the worker hasn't caught up.
function effectiveStatus(drop: Drop, now: number): ProductStatus | null {
  if (drop.status === 'draft' || drop.status === 'cancelled') return null

  const opens = new Date(drop.opens_at).getTime()
  const closes = new Date(drop.closes_at).getTime()

  if (drop.status === 'closed' || now >= closes) return 'closed'
  if (drop.status === 'open') return now >= opens ? 'open' : 'scheduled'
  // scheduled
  return now >= opens ? 'open' : 'scheduled'
}

async function getStatusByProduct(): Promise<Map<string, ProductStatus>> {
  const res = await fetch(`${process.env.FASTAPI_URL}/drops`, {
    next: { revalidate: 30 },
  })

  // Throwing keeps the last good cached page instead of showing an empty shop.
  if (!res.ok) throw new Error(`Could not load drops (${res.status})`)

  const drops: Drop[] = await res.json()
  const now = Date.now()
  const byProduct = new Map<string, ProductStatus>()

  for (const drop of drops) {
    const status = effectiveStatus(drop, now)
    if (!status) continue

    for (const item of drop.items) {
      const current = byProduct.get(item.product_id)
      // A product in several drops shows its "best" status: open > upcoming > closed.
      if (current === undefined || STATUS_PRIORITY[status] < STATUS_PRIORITY[current]) {
        byProduct.set(item.product_id, status)
      }
    }
  }

  return byProduct
}

export const revalidate = 60

export default async function ShopPage() {
  const [sanityProducts, statusByProduct] = await Promise.all([
    client.fetch<SanityProduct[]>(PRODUCTS_QUERY),
    getStatusByProduct(),
  ])

  // Products that aren't in any visible drop (none, draft only, cancelled only) are hidden.
  const products: Product[] = sanityProducts
    .flatMap((p) => {
      const status = statusByProduct.get(p._id)
      return status ? [{ ...p, status }] : []
    })
    .sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status])

  return (
    <main className="relative z-20 mx-auto md:px-30 px-5 py-12">
      <div className="m-2 sm:m-10">
        <div className="py-10 flex flex-col gap-6">
          <h1 className="text-3xl sm:text-7xl font-arts-crafts-regular">
                Shop
          </h1>
        </div>
        <ProductsGrid products={products} />
      </div>
    </main>
  )
}