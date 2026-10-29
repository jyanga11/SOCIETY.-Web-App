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
    <main className="relative z-20 mx-auto md:px-30 px-5 py-12">
      <div className="m-2 sm:m-10">
        <div className="py-10 flex flex-col gap-6">
          <h1 className="text-3xl sm:text-7xl font-arts-crafts-regular">
                Projects
          </h1>
        </div>
        <ProjectsGrid projects={projects} />
      </div>
    </main>
  )
}