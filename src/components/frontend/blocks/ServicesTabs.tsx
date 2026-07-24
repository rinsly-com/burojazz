'use client'

import Link from 'next/link'
import { type ReactNode, useState } from 'react'

import type { Page } from '@/payload-types'
import { ArrowIcon } from '@/components/frontend/ui/ArrowIcon'
import { hrefFor, type LinkFields } from '@/components/frontend/ui/CMSLink'
import { Modal } from '@/components/frontend/ui/Modal'

type ServicesBlock = Extract<NonNullable<Page['layout']>[number], { blockType: 'services' }>
/** A service card as stored in the CMS — the source of the `details` shape. */
type CMSServiceCard = NonNullable<NonNullable<ServicesBlock['tabs']>[number]['cards']>[number]

export type CardData = {
  number?: string | null
  title?: string | null
  description?: string | null
  link?: LinkFields | null
  id?: string | null
  /** Raw read-more rich text; Services.tsx renders it into `detailsNode`. */
  details?: CMSServiceCard['details']
  /** Tabler icon component name from the CMS (e.g. "IconHeart"). */
  icon?: string | null
  /**
   * Server-rendered icon element for the white circle, injected by the parent
   * server component (Services.tsx). Kept as a node so the Tabler icon barrel
   * stays server-side and no icon JS ships to the browser.
   */
  iconNode?: ReactNode
  /**
   * Server-rendered `details` rich text, injected by Services.tsx the same way
   * as `iconNode` so the lexical renderer never ships to the browser. When set,
   * the card's read-more link opens the dialog instead of navigating.
   */
  detailsNode?: ReactNode
}

export type TabData = {
  label?: string | null
  cards?: CardData[] | null
  id?: string | null
}

const READ_MORE_CLASSES =
  'inline-flex items-center gap-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80'

function ServiceCard({
  card,
  index,
  onOpenDetails,
}: {
  card: CardData
  index: number
  /** Set when the card has `details` rich text — opens the dialog. */
  onOpenDetails?: () => void
}) {
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
          <div
            className="flex size-[60px] shrink-0 items-center justify-center rounded-full bg-white text-brand"
            aria-hidden="true"
          >
            {card.iconNode}
          </div>
          <p className="text-xl font-bold text-white">
            {card.number ?? String(index + 1).padStart(2, '0')}
          </p>
        </div>
        <div className="flex flex-col gap-3 text-white">
          <h3 className="text-lg font-bold leading-[1.5]">{card.title ?? ''}</h3>
          <p className="text-sm font-medium leading-[1.5]">{card.description ?? ''}</p>
        </div>
        {onOpenDetails ? (
          <button type="button" onClick={onOpenDetails} className={`self-start ${READ_MORE_CLASSES}`}>
            {card.link?.label ?? 'Lees verder'}
            <ArrowIcon />
          </button>
        ) : (
          <Link
            href={hrefFor(card.link)}
            target={card.link?.newTab ? '_blank' : undefined}
            rel={card.link?.newTab ? 'noopener noreferrer' : undefined}
            className={READ_MORE_CLASSES}
          >
            {card.link?.label ?? 'Lees verder'}
            <ArrowIcon />
          </Link>
        )}
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

const DETAILS_TITLE_ID = 'service-details-title'

/**
 * Interactive tab switcher for the Services block. Clicking a tab pill shows
 * that tab's service cards; clicking the read-more link of a card that has
 * `details` rich text opens it in a dialog. Client component (owns the
 * active-tab and open-card state); the surrounding section header and each
 * card's icon + details rich text stay server-rendered in Services.tsx.
 */
export function ServicesTabs({ tabs }: { tabs: TabData[] }) {
  const [active, setActive] = useState(0)
  const [openCard, setOpenCard] = useState<number | null>(null)
  const activeTab = tabs[active] ?? tabs[0]
  const cards = activeTab?.cards ?? []
  const detailsCard = openCard === null ? null : (cards[openCard] ?? null)

  /** Switching tabs re-indexes the cards, so close any open dialog with it. */
  const selectTab = (index: number) => {
    setActive(index)
    setOpenCard(null)
  }

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
              onClick={() => selectTab(i)}
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
          <ServiceCard
            key={card.id ?? i}
            card={card}
            index={i}
            onOpenDetails={card.detailsNode ? () => setOpenCard(i) : undefined}
          />
        ))}
      </div>

      {/* Read-more dialog for the card that has `details` rich text */}
      <Modal
        open={detailsCard !== null}
        onClose={() => setOpenCard(null)}
        labelledBy={DETAILS_TITLE_ID}
        className="m-auto w-[min(720px,calc(100vw-2rem))] rounded-3xl bg-white p-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        {detailsCard && (
          <div className="flex flex-col gap-6 pr-10">
            <div className="flex items-start gap-4">
              <div
                className="flex size-[60px] shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand"
                aria-hidden="true"
              >
                {detailsCard.iconNode}
              </div>
              <h2
                id={DETAILS_TITLE_ID}
                className="text-xl font-bold leading-[1.3] text-black md:text-2xl"
              >
                {detailsCard.title ?? ''}
              </h2>
            </div>
            <div className="flex flex-col gap-[1.6em] text-sm font-medium leading-[1.6] text-ink [&_a]:text-brand [&_a]:underline">
              {detailsCard.detailsNode}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
