import Link from 'next/link'

import type { Page } from '@/payload-types'
import { ArrowIcon } from '@/components/frontend/ui/ArrowIcon'
import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'services' }>

const DEFAULT_TABS = ['Behandeling', 'Begeleiding', 'Diagnostiek & Consultatie', 'Crisis & Verblijf']

const DEFAULT_CARDS = [
  {
    number: '01',
    title: 'Cognitieve Gedragstherapie (CGT)',
    description: 'Korte, doelgerichte behandeling om negatieve denk- en gedragspatronen te veranderen.',
  },
  {
    number: '02',
    title: 'Trauma behandeling',
    description: 'Hulp bij het verwerken van ingrijpende ervaringen in een veilige setting.',
  },
  {
    number: '03',
    title: 'Systeemtherapie',
    description: 'Behandeling die relaties en gezinsdynamiek centraal stelt.',
  },
  {
    number: '04',
    title: 'Psychomotore Therapie (PMT)',
    description: 'Therapie gericht op lichaam, gedrag en emotie via beweging en ervaring.',
  },
  {
    number: '05',
    title: 'Theraplay',
    description: 'Speelse therapie om de band tussen ouder en kind te verbeteren.',
  },
]

type CardData = {
  number?: string | null
  title?: string | null
  description?: string | null
  linkLabel?: string | null
  linkUrl?: string | null
  id?: string | null
}

function ServiceCard({ card, index }: { card: CardData; index: number }) {
  const fallback = DEFAULT_CARDS[index] ?? {}

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
            {card.number ?? fallback.number ?? String(index + 1).padStart(2, '0')}
          </p>
        </div>
        <div className="flex flex-col gap-3 text-white">
          <h3 className="text-lg font-bold leading-[1.5]">{card.title ?? fallback.title ?? ''}</h3>
          <p className="text-sm font-medium leading-[1.5]">
            {card.description ?? fallback.description ?? ''}
          </p>
        </div>
        <Link
          href={card.linkUrl ?? '#'}
          className="inline-flex items-center gap-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
        >
          {card.linkLabel ?? 'Lees verder'}
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
 * "Hulpverleningsvormen" section: centered eyebrow pill + title, static tab
 * pills (first active) and five numbered teal service cards (3 + 2 on desktop,
 * stacking on mobile).
 */
export function Services(props: Props) {
  const eyebrow = props.eyebrow ?? 'Hulpverleningsvormen'
  const title = props.title ?? 'Ambulante jeugdhulp en verblijf, gericht op behandeling en begeleiding.'
  const tabs = props.tabs?.length
    ? props.tabs.map((tab) => tab.label ?? '')
    : DEFAULT_TABS
  const cards: CardData[] = props.cards?.length ? props.cards : DEFAULT_CARDS

  return (
    <Section py="py-16 md:py-[120px]" className="flex flex-col items-center gap-12 md:gap-20">
      <div className="flex max-w-[700px] flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2.5 rounded-pill bg-brand/5 px-3 py-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/services/diamond.svg" alt="" aria-hidden="true" width={14} height={14} />
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <h2 className="text-center text-[28px] font-semibold leading-[1.2] tracking-[0.02em] text-black md:text-[40px]">
          {title}
        </h2>
      </div>
      <div className="flex w-full flex-col gap-6 md:gap-12">
        {/* Static tab pills — first tab active (no client JS in v1) */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-6">
          {tabs.map((label, i) => (
            <span
              key={i}
              className={
                i === 0
                  ? 'flex items-center rounded-[14px] bg-brand px-[18px] py-4 text-sm font-medium text-white md:py-6'
                  : 'flex items-center rounded-[14px] border border-ink/5 bg-white px-[18px] py-4 text-sm font-medium text-ink md:py-6'
              }
            >
              {label}
            </span>
          ))}
        </div>
        <div className="flex w-full flex-wrap justify-center gap-6">
          {cards.map((card, i) => (
            <ServiceCard key={card.id ?? i} card={card} index={i} />
          ))}
        </div>
      </div>
    </Section>
  )
}
