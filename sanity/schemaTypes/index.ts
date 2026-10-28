import { type SchemaTypeDefinition } from 'sanity'

import {blogContentType} from './blogContentType'
import {projectType} from './projectType'
import {productType} from './productType'
import { sizeScaleType } from './sizeScaleType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blogContentType, projectType, productType, sizeScaleType],
}