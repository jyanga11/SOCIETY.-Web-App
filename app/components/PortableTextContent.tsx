import Image from 'next/image'
import { PortableText, type PortableTextComponents } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/types'

import { urlFor } from '@/sanity/lib/image'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-4 text-base leading-relaxed opacity-90">{children}</p>,
    h1: ({ children }) => <h2 className="mb-4 mt-8 text-3xl font-semibold">{children}</h2>,
    h2: ({ children }) => <h2 className="mb-4 mt-8 text-2xl font-semibold">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-3 mt-6 text-xl font-semibold">{children}</h3>,
    h4: ({ children }) => <h4 className="mb-3 mt-6 text-lg font-semibold">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-2 border-current pl-4 italic opacity-80">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mb-4 list-disc space-y-2 pl-6 opacity-90">{children}</ul>,
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        className="underline underline-offset-2 hover:opacity-80"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null

      return (
        <div className="relative my-8 aspect-[16/9] overflow-hidden bg-black/5">
          <Image
            src={urlFor(value).width(1200).height(675).fit('crop').url()}
            alt={value.alt ?? ''}
            fill
            sizes="(min-width: 1024px) 800px, 100vw"
            className="object-cover"
          />
        </div>
      )
    },
  },
}

export default function PortableTextContent({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />
}
