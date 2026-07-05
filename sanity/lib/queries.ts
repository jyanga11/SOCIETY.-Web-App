// sanity/lib/queries.ts
import { client } from './client'
import { urlFor } from './image'

export async function getProjects() {
  const projects = await client.fetch(
    `*[_type == "project"] | order(uploadDate desc){
      _id, title, slug, coverImage
    }`
  )
  return projects.map((p: any) => ({
    id: p._id,
    title: p.title,
    image: urlFor(p.coverImage).width(600).url(),
    href: `/projects/${p.slug.current}`,
  }))
}

export async function getProducts() {
  const products = await client.fetch(
    `*[_type == "product"] | order(title asc){
      _id, title, slug, coverImage
    }`
  )
  return products.map((p: any) => ({
    id: p._id,
    title: p.title,
    image: urlFor(p.coverImage).width(600).url(),
    href: `/shop/${p.slug.current}`,
  }))
}

export async function getNews() {
  const posts = await client.fetch(
    `*[_type == "blogContent"] | order(uploadDate desc){
      _id, title, slug, coverImage, uploadDate
    }`
  )
  return posts.map((p: any) => ({
    id: p._id,
    title: p.title,
    image: urlFor(p.coverImage).width(600).url(),
    href: `/news/${p.slug.current}`,
    uploadDate: p.uploadDate,
  }))
}