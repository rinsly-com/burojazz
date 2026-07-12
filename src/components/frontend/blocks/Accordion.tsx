import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Page } from '@/payload-types'
import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'accordion' }>

/**
 * Generic accordion section: 0…N collapsible items. Uses native
 * <details>/<summary> so it stays a zero-JS server component.
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

      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {items.map((item, index) => (
          <details
            key={item.id ?? index}
            className="group rounded-3xl border border-brand/20 bg-white open:border-brand"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold text-black [&::-webkit-details-marker]:hidden">
              {item.title}
              <span
                aria-hidden
                className="text-brand transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            {item.body && (
              <div className="px-6 pb-6 text-sm leading-relaxed text-ink/90">
                <RichText data={item.body} disableContainer />
              </div>
            )}
          </details>
        ))}
      </div>
    </Section>
  )
}
