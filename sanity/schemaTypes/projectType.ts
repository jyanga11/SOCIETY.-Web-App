import {defineField, defineType, defineArrayMember} from 'sanity'
import {CaseIcon} from '@sanity/icons/Case'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: CaseIcon,
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
      description: 'A short summary of the project.',
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
      name: 'uploadDate',
      title: 'Upload Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Album/Single', value: 'album/single'},
          {title: 'Music Video', value: 'music video'},
          {title: 'Film', value: 'film'},
          {title: 'Photography', value: 'photography'},
          {title: 'Artwork', value: 'artwork'},
          {title: 'Clothing', value: 'clothing'},
        ],
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Media Gallery',
      description: 'Additional images or videos associated with this project.',
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
      date: 'uploadDate',
      category: 'category',
    },
    prepare({title, media, date, category}) {
      const dateLabel = date ? new Date(date).toLocaleDateString() : undefined
      return {
        title,
        subtitle: [category, dateLabel].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})