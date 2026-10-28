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
    /*defineField({
      name: 'stage',
      title: 'Stage',
      type: 'string',
      options: {
        list: [
          {title: 'Pre-order', value: 'preorder'},
          {title: 'On Sale', value: 'open'},
          {title: 'Closed', value: 'closed'},
          {title: 'Sold Out', value: 'sold_out'},
        ],
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),*/
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Price in USD, e.g. 42.00',
      validation: (rule) => rule.required().positive().precision(2),
    }),
    defineField({
      name: 'sizeScale',
      title: 'Size scale',
      type: 'reference',
      to: [{type: 'sizeScale'}],
      description:
        'The sizing system this product uses (e.g. Apparel S–XXL, Shoes US 6–13, One size). Used as a template when filling in variants.',
    }),
    defineField({
      name: 'variants',
      title: 'Variants',
      description:
        'Every sellable version of this product (one per size, and per color if it comes in several). The SKU is the stable ID used by the order system, so never change it once the product has been in a drop. To retire a variant, untick Active rather than deleting it. Products with no sizes need a single variant with size "One size".',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'variant',
          fields: [
            defineField({
              name: 'sku',
              title: 'SKU',
              type: 'string',
              description: 'Unique and permanent, e.g. TEE-BLK-XL. Uppercase letters, numbers and dashes.',
              validation: (rule) =>
                rule
                  .required()
                  .regex(/^[A-Z0-9]+(-[A-Z0-9]+)*$/, {name: 'sku'})
                  .error('Use uppercase letters, numbers and single dashes only.')
                  .custom(async (sku, context) => {
                    if (!sku) return true
            
                    const client = context.getClient({apiVersion: '2024-01-01'})
                    const id = (context.document?._id ?? '').replace(/^drafts\./, '')
            
                    const count = await client.fetch(
                      `count(*[
                        _type == "product" &&
                        !(_id in [$id, "drafts." + $id]) &&
                        $sku in variants[].sku
                      ])`,
                      {id, sku},
                    )
            
                    return count === 0 || 'This SKU is already used by another product.'
                  }),
            }),
            defineField({
              name: 'size',
              title: 'Size',
              type: 'string',
              description: 'Display label, e.g. XL, US 10, 24x36 in, One size.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'color',
              title: 'Color / option',
              type: 'string',
              description: 'Optional. Color or any other option that distinguishes variants of the same size.',
            }),
            defineField({
              name: 'active',
              title: 'Active',
              type: 'boolean',
              initialValue: true,
            }),
          ],
          preview: {
            select: {sku: 'sku', size: 'size', color: 'color', active: 'active'},
            prepare({sku, size, color, active}) {
              return {
                title: sku || 'New variant',
                subtitle: [size, color, active === false ? 'inactive' : undefined]
                  .filter(Boolean)
                  .join(' · '),
              }
            },
          },
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .custom((variants) => {
            const skus = ((variants as Array<{sku?: string}> | undefined) ?? [])
              .map((v) => v.sku)
              .filter(Boolean)

            return new Set(skus).size === skus.length || 'Each variant needs a unique SKU.'
          }),
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
      variants: 'variants',
    },
    prepare({title, media, category, price, variants}) {
      const priceLabel = typeof price === 'number' ? `$${price.toFixed(2)}` : undefined
      const count = Array.isArray(variants) ? variants.length : 0
      const variantLabel = count > 0 ? `${count} variant${count === 1 ? '' : 's'}` : 'no variants'
      return {
        title,
        subtitle: [category, priceLabel, variantLabel].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})