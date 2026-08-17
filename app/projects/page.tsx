import { client } from '@/sanity/lib/client'

import ProjectsGrid, { type Project } from '../components/ProjectsGrid'

const PROJECTS_QUERY = `*[_type == "project"] | order(uploadDate desc){
  _id,
  title,
  slug,
  description,
  category,
  uploadDate,
  coverImage
}`

// Revalidate periodically so new/edited Studio content shows up without a full redeploy.
export const revalidate = 60

export default async function ProjectsPage() {
  const projects = await client.fetch<Project[]>(PROJECTS_QUERY)

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <ProjectsGrid projects={projects} />
    </main>
  )
}