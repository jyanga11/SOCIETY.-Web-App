// structure.ts
import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('project').title('Projects'),
      S.documentTypeListItem('product').title('Products'),
      S.documentTypeListItem('blogContent').title('News'),
    ])