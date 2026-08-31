import React from 'react'
import { RichTextField } from '@rinsly-com/site-core/ui'
import { editable } from '@rinsly-com/site-core/preview'

import type { Page } from '@/payload-types'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'richText' }>

/** Free-form rich text section, at reading or full width. */
export function RichTextBlock({ content, width }: Props) {
  if (!content) return null

  return (
    <Section className="py-12 md:py-16">
      {/* `rich-text` (globals.css) styles the CMS output: headings, lists,
          quotes, rules. RichTextField renders the same markup publicly, and in
          preview opens an in-page Lexical editor on click. */}
      <div
        className={`rich-text text-sm leading-relaxed text-ink/90 ${
          width === 'wide' ? '' : 'mx-auto max-w-3xl'
        }`}
        {...editable('content', { inline: false })}
      >
        <RichTextField data={content} field="content" />
      </div>
    </Section>
  )
}
