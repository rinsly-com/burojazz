'use client'

import Link from 'next/link'
import { useState } from 'react'

import { ArrowIcon } from '@/components/frontend/ui/ArrowIcon'
import { hrefFor, type LinkFields } from '@/components/frontend/ui/CMSLink'

export type CardData = {
  number?: string | null
  title?: string | null
  description?: string | null
  link?: LinkFields | null
  id?: string | null
}

export type TabData = {
  label?: string | null
  cards?: CardData[] | null
  id?: string | null
}

function ServiceCard({ card, index }: { card: CardData; index: number }) {
  return (
    <article className="relative flex w-full flex-col gap-[42px] overflow-hidden rounded-3xl bg-brand p-8 md:w-[calc(50%-12px)] lg:w-[calc((100%-48px)/3)]">
      {/* Decorative blurred blob shine (per design) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/services/blob-shine.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -left-1/4 top-1/2 w-[180%] max-w-none rotate-[147deg] select-none"
      />
      <div className="relative flex w-full flex-col gap-8">
        <div className="flex w-full items-start justify-between gap-9">
          <div className="size-[60px] rounded-full bg-white" aria-hidden="true" />
          <p className="text-xl font-bold text-white">
            {card.number ?? String(index + 1).padStart(2, '0')}
          </p>
        </div>
        <div className="flex flex-col gap-3 text-white">
          <h3 className="text-lg font-bold leading-[1.5]">{card.title ?? ''}</h3>
          <p className="text-sm font-medium leading-[1.5]">{card.description ?? ''}</p>
        </div>
        <Link
          href={hrefFor(card.link)}
          target={card.link?.newTab ? '_blank' : undefined}
          rel={card.link?.newTab ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
        >
          {card.link?.label ?? 'Lees verder'}
          <ArrowIcon />
        </Link>
      </div>
      {/* Watermark logo bottom-right */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/services/card-logo.svg"
        alt=""
        aria-hidden="true"
        className="relative ml-auto size-[88px] opacity-25"
      />
    </article>
  )
}

/**
 * Interactive tab switcher for the Services block. Clicking a tab pill shows
 * that tab's service cards. Client component (owns the active-tab state); the
 * surrounding section header stays server-rendered in Services.tsx.
 */
export function ServicesTabs({ tabs }: { tabs: TabData[] }) {
  const [active, setActive] = useState(0)
  const activeTab = tabs[active] ?? tabs[0]
  const cards = activeTab?.cards ?? []

  return (
    <div className="flex w-full flex-col gap-6 md:gap-12">
      {/* Clickable tab pills */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-6" role="tablist">
        {tabs.map((tab, i) => {
          const selected = i === active
          return (
            <button
              key={tab.id ?? i}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(i)}
              className={
                selected
                  ? 'flex items-center rounded-[14px] bg-brand px-[18px] py-4 text-sm font-medium text-white transition-colors md:py-6'
                  : 'flex items-center rounded-[14px] border border-ink/5 bg-white px-[18px] py-4 text-sm font-medium text-ink transition-colors hover:bg-brand/5 md:py-6'
              }
            >
              {tab.label ?? ''}
            </button>
          )
        })}
      </div>

      {/* Active tab's cards */}
      <div className="flex w-full flex-wrap justify-center gap-6">
        {cards.map((card, i) => (
          <ServiceCard key={card.id ?? i} card={card} index={i} />
        ))}
      </div>
    </div>
  )
}
