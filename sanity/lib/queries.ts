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
      _id, title, slug, coverImage
    }`, {},
    { next: { revalidate : 60 } }
  )
  return products.map((p: any) => ({
    id: p._id,
    title: p.title,
    image: urlFor(p.coverImage).width(600).url(),
    slug: p.slug,
  }))
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