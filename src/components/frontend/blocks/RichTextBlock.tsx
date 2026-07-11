import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Page } from '@/payload-types'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'richText' }>

/** Free-form rich text section, at reading or full width. */
export function RichTextBlock({ content, width }: Props) {
  if (!content) return null

  return (
    <Section className="py-12 md:py-16">
      <div
        className={`prose-headings:font-semibold prose-a:text-brand text-sm leading-relaxed text-ink/90 ${
          width === 'wide' ? '' : 'mx-auto max-w-3xl'
        }`}
      >
        <RichText data={content} />
      </div>
    </Section>
  )
}
