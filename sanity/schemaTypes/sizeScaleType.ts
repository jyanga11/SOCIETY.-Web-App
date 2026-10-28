import {defineField, defineType, defineArrayMember} from 'sanity'
import {ComponentIcon} from '@sanity/icons/Component'

export const sizeScaleType = defineType({
  name: 'sizeScale',
  title: 'Size Scale',
  type: 'document',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g. Apparel S–XXL, Shoes US 6–13, Hats S/M + L/XL, One size',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sizes',
      title: 'Sizes',
      description: 'In the order they should appear.',
      type: 'array',
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'sizeOption',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'What customers see, e.g. XL, US 10, One size.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'code',
              title: 'SKU code',
              type: 'string',
              description: 'Short code used when building SKUs, e.g. XL, 10, OS.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'measurements',
              title: 'Measurements',
              type: 'string',
              description: 'Optional, for the size chart. e.g. Chest 22 in · Length 29 in',
            }),
          ],
          preview: {
            select: {title: 'label', subtitle: 'code'},
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', sizes: 'sizes'},
    prepare({title, sizes}) {
      const count = Array.isArray(sizes) ? sizes.length : 0
      return {title, subtitle: `${count} size${count === 1 ? '' : 's'}`}
    },
  },
})