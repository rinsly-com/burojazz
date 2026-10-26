'use client'

import type { ReactNode } from 'react'

import { Accordion } from '@rinsly-com/ui/accordion'

export type AccordionListItem = {
  value: string
  title: string
  /** Server-rendered body. Null when the item has no rich text. */
  body: ReactNode
}

/**
 * Collapsible items for the Accordion block. Several items can be open at
 * once, and they all start closed — the same behaviour as the old
 * `<details>` list. `hiddenUntilFound` keeps closed bodies searchable.
 *
 * Bodies are passed in already rendered so the Lexical renderer stays on the
 * server.
 */
export function AccordionItems({ items }: { items: AccordionListItem[] }) {
  return (
    <Accordion.Root multiple hiddenUntilFound className="mx-auto flex max-w-3xl flex-col gap-4">
      {items.map((item) => (
        <Accordion.Item
          key={item.value}
          value={item.value}
          className={(state) =>
            `group rounded-3xl border bg-white ${state.open ? 'border-brand' : 'border-brand/20'}`
          }
        >
          <Accordion.Header render={<div />} className="m-0">
            <Accordion.Trigger className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold text-black">
              {item.title}
              <span
                aria-hidden
                className="text-brand transition-transform duration-200 group-data-[open]:rotate-45"
              >
                +
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          {item.body && <Accordion.Panel>{item.body}</Accordion.Panel>}
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
