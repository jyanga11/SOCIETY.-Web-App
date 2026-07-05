import {defineField, defineType, defineArrayMember} from 'sanity'
import {PackageIcon} from '@sanity/icons/Package'

export const productType = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  icon: PackageIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Apparel', value: 'apparel'},
          {title: 'Accessories', value: 'accessories'},
          {title: 'Artwork', value: 'artwork'},
          {title: 'Home', value: 'home'},
        ],
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Price in USD, e.g. 42.00',
      validation: (rule) => rule.required().positive().precision(2),
    }),
    defineField({
      name: 'gallery',
      title: 'Media Gallery',
      description: 'Additional images or videos associated with this product.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
            }),
          ],
        }),
        defineArrayMember({
          type: 'file',
          title: 'Video',
          options: {
            accept: 'video/*',
          },
        }),
      ],
      options: {
        layout: 'grid',
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      category: 'category',
      price: 'price',
    },
    prepare({title, media, category, price}) {
      const priceLabel = typeof price === 'number' ? `$${price.toFixed(2)}` : undefined
      return {
        title,
        subtitle: [category, priceLabel].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})