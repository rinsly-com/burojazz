import React from 'react'
import { RichTextField } from '@rinsly-com/site-core/ui'
import { editable } from '@rinsly-com/site-core/preview'

import type { Page } from '@/payload-types'
import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Section } from '@/components/frontend/ui/Section'
import { AccordionItems } from '@/components/frontend/blocks/AccordionItems'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'accordion' }>

/**
 * Generic accordion section: 0…N collapsible items. The open/close behaviour
 * lives in the client `AccordionItems` (Base UI via `@rinsly-com/ui/accordion`);
 * this file stays a server component so item bodies can be rendered here.
 *
 * Item bodies are rich text — Lexical objects have no string for the overlay
 * to match, so they go through RichTextField + editable() (same pattern as
 * site-core's RichTextBlock).
 */
export function Accordion({ header, items }: Props) {
  if (!items?.length) return null

  return (
    <Section className="py-16 md:py-24">
      {(header?.eyebrow || header?.title || header?.subtitle || header?.intro) && (
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          {header?.eyebrow && <Eyebrow>{header.eyebrow}</Eyebrow>}
          {header?.title && (
            <h2 className="text-3xl font-semibold tracking-[0.02em] text-black md:text-[40px] md:leading-[1.2]">
              {header.title}
            </h2>
          )}
          {header?.subtitle && <p className="text-lg font-medium text-ink">{header.subtitle}</p>}
          {header?.intro && <p className="max-w-xl text-sm text-ink/80">{header.intro}</p>}
        </div>
      )}

      <AccordionItems
        items={items.map((item, index) => {
          const bodyField = `items.${index}.body`
          return {
            value: item.id ?? `accordion-${index}`,
            title: item.title ?? '',
            body: item.body ? (
              <div
                className="rich-text px-6 pb-6 text-sm leading-relaxed text-ink/90"
                {...editable(bodyField, { inline: false })}
              >
                <RichTextField data={item.body} field={bodyField} />
              </div>
            ) : null,
          }
        })}
      />
    </Section>
  )
}
