import { client } from '@/sanity/lib/client'

import ProductsGrid, { type Product } from '../components/ProductsGrid'

const PRODUCTS_QUERY = `*[_type == "product"] | order(title asc){
  _id,
  title,
  slug,
  description,
  category,
  price,
  coverImage
}`

export const revalidate = 60

export default async function ShopPage() {
  const products = await client.fetch<Product[]>(PRODUCTS_QUERY)

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <ProductsGrid products={products} />
    </main>
  )
}
