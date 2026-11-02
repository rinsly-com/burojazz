'use client'

import type { ReactNode } from 'react'

import { Accordion } from '@rinsly-com/ui/accordion'

export type AccordionItem = {
  key: string
  heading: string
  /** Pre-rendered on the server so the Tabler barrel and Lexical renderer
   *  never ship to the client — this component only owns open state + motion. */
  icon: ReactNode
  body: ReactNode
}

/**
 * Vision & mission accordion: one card open at a time (the first, on load),
 * and the open card can be closed. The collapse uses the grid `0fr → 1fr`
 * trick (transitionable in every engine, including Gecko). The whole card
 * header is the trigger, so the entire closed card is the click target.
 */
export function VisionMissionAccordion({ items }: { items: AccordionItem[] }) {
  const first = items[0]?.key

  return (
    <Accordion.Root defaultValue={first ? [first] : []} className="flex w-full flex-col gap-5">
      {items.map((item) => (
        <Accordion.Item
          key={item.key}
          value={item.key}
          className={(state) =>
            `group w-full overflow-hidden rounded-[24px] border border-ink/5 transition-colors duration-300 ${
              state.open ? 'bg-brand' : 'bg-white'
            }`
          }
        >
          <Accordion.Header render={<div />} className="m-0">
            <Accordion.Trigger
              className={(state) =>
                `flex w-full cursor-pointer items-center gap-6 p-6 text-left ${
                  state.open ? 'flex-col items-start' : ''
                }`
              }
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors group-data-[open]:bg-white group-data-[open]:text-brand">
                {item.icon}
              </span>
              <span className="text-xl font-bold text-ink group-data-[open]:text-white">
                {item.heading}
              </span>
            </Accordion.Trigger>
          </Accordion.Header>

          {item.body && (
            <Accordion.Panel
              keepMounted
              hidden={false}
              className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
              style={(state) => ({ gridTemplateRows: state.open ? '1fr' : '0fr' })}
            >
              <div className="overflow-hidden">
                <div className="rich-text [--rt-accent:currentColor] [--rt-heading:currentColor] px-6 pb-6 text-sm leading-[1.6] font-medium text-white">
                  {item.body}
                </div>
              </div>
            </Accordion.Panel>
          )}
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
