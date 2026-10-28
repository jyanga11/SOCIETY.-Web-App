// sanity/lib/queries.ts
import { client } from './client'
import { urlFor } from './image'

export async function getProjects() {
  const projects = await client.fetch(
    `*[_type == "project"] | order(uploadDate desc){
      _id, title, slug, coverImage
    }`, {},
    { next: { revalidate: 60 } }
  )
  return projects.map((p: any) => ({
    id: p._id,
    title: p.title,
    image: urlFor(p.coverImage).width(600).url(),
    slug: p.slug,
  }))
}

export async function getProducts() {
  const products = await client.fetch(
    `*[_type == "product"] | order(title asc){
      _id, title, slug, coverImage, stage, price, category
    }`, {},
    { next: { revalidate : 60 } }
  )

  return products
}

export async function getProduct(id: string) {
  return client.fetch<{ _id: string; title: string; price: number } | null>(
    `*[_type == "product" && _id == $id][0]{ _id, title, price, stage }`,
    { id },
    { cache: 'no-store' }
  )
}

export async function getNews() {
  const posts = await client.fetch(
    `*[_type == "blogContent"] | order(uploadDate desc){
      _id, title, slug, coverImage, uploadDate
    }`, {},
    { next : { revalidate : 60 } }
  )
  return posts.map((p: any) => ({
    id: p._id,
    title: p.title,
    image: urlFor(p.coverImage).width(600).url(),
    slug: p.slug,
    uploadDate: p.uploadDate,
  }))
}