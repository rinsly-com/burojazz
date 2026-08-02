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
      {/* `rich-text` (globals.css) styles the CMS output: headings, lists,
          quotes, rules. The prose-* classes that used to be here did nothing —
          this project has no @tailwindcss/typography plugin installed. */}
      <div
        className={`rich-text text-sm leading-relaxed text-ink/90 ${
          width === 'wide' ? '' : 'mx-auto max-w-3xl'
        }`}
      >
        {/* disableContainer: without it the renderer adds its own wrapper div,
            which would sit between `.rich-text` and the content. Every other
            caller on the site already disables it. */}
        <RichText data={content} disableContainer />
      </div>
    </Section>
  )
}
