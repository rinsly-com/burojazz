'use client'

import { useId, useState, type ReactNode } from 'react'

export type AccordionItem = {
  key: string
  heading: string
  /** Pre-rendered on the server so the Tabler barrel and Lexical renderer
   *  never ship to the client — this component only owns open state + motion. */
  icon: ReactNode
  body: ReactNode
}

/**
 * Vision & mission accordion: one card open at a time, animated open/close.
 *
 * Client component because the animation must work in every engine — Gecko
 * (Zen/Firefox) doesn't support the CSS `::details-content` approach. The
 * collapse uses the grid `0fr → 1fr` trick (transitionable everywhere) and the
 * whole card header is a full-width button, so the entire closed card is the
 * click target.
 */
export function VisionMissionAccordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState(0)
  const baseId = useId()

  return (
    <div className="flex w-full flex-col gap-5">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        const panelId = `${baseId}-${i}`
        return (
          <div
            key={item.key}
            className={`w-full overflow-hidden rounded-[24px] border border-ink/5 transition-colors duration-300 ${
              isOpen ? 'bg-brand' : 'bg-white'
            }`}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              className={`flex w-full cursor-pointer items-center gap-6 p-6 text-left ${
                isOpen ? 'flex-col items-start' : ''
              }`}
            >
              <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isOpen ? 'bg-white text-brand' : 'bg-brand text-white'
                }`}
              >
                {item.icon}
              </span>
              <span className={`text-xl font-bold ${isOpen ? 'text-white' : 'text-ink'}`}>
                {item.heading}
              </span>
            </button>

            {item.body && (
              <div
                id={panelId}
                role="region"
                className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 text-sm leading-[1.6] font-medium text-white [&_a]:underline [&_p]:mt-[1em] [&_p:first-child]:mt-0">
                    {item.body}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
