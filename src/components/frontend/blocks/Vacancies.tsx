import Link from 'next/link'

import type { Page } from '@/payload-types'
import { ArrowIcon } from '@/components/frontend/ui/ArrowIcon'
import { hrefFor, type LinkFields } from '@/components/frontend/ui/CMSLink'
import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Icon } from '@/components/frontend/ui/Icon'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'vacancies' }>

const FALLBACK_CARDS: {
  title: string
  location: string
  hours: string
  text: string
  link?: LinkFields
}[] = [
  {
    title: 'Ambulant Jeugd- en Gezinshulpverlener (m/v)',
    location: 'Montfoort',
    hours: 'Voltijd of deeltijd',
    text: 'Begeleid jongeren en gezinnen in hun eigen leefomgeving met aandacht en betrokkenheid.',
  },
  {
    title: 'Behandelaar Jeugd (m/v)',
    location: 'Montfoort',
    hours: 'Voltijd of deeltijd',
    text: 'Bied passende behandeling en ondersteuning aan jongeren in hun ontwikkeling.',
  },
  {
    title: 'Regiebehandelaar (m/v)',
    location: 'Montfoort',
    hours: 'Voltijd of deeltijd',
    text: 'Neem de regie in complexe behandeltrajecten en werk samen aan duurzame zorg.',
  },
]

const CARD_IMAGES = [
  '/images/vacancies/card-1.jpg',
  '/images/vacancies/card-2.jpg',
  '/images/vacancies/card-3.jpg',
]

function Tag({ icon, label }: { icon: 'location' | 'clock'; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-pill bg-brand/5 px-3 py-2 text-xs font-bold text-brand transition-colors group-hover:bg-white/15 group-hover:text-white"
    >
      <Icon
        fallback={icon === 'location' ? 'IconMapPin' : 'IconClock'}
        size={16}
        stroke={1.25}
        className="shrink-0"
      />
      {label}
    </span>
  )
}

/**
 * "Word onderdeel van ons team" — vacancy cards section.
 * Cards are white with a hairline border and turn teal on hover (group-hover).
 */
export function Vacancies(props: Props) {
  const title = props.header?.title ?? 'Word onderdeel van ons team'
  const intro = props.header?.intro ?? 'Samen aan de missie en visie van Buro J.A.Z.Z werken'
  const cards = props.cards && props.cards.length > 0 ? props.cards : FALLBACK_CARDS

  return (
    <Section id="vacatures" py="py-16 md:py-[120px]">
      {/* Header */}
      <div className="flex flex-col items-center gap-6 text-center">
        <span className="inline-flex items-center gap-2.5 rounded-pill bg-brand/5 px-3 py-2.5 text-brand">
          <Icon name={props.header?.icon} fallback="IconBriefcase" size={14} className="shrink-0" />
          <Eyebrow>{props.header?.eyebrow ?? 'Vacatures'}</Eyebrow>
        </span>
        <h2 className="max-w-[700px] text-3xl font-semibold leading-[1.2] tracking-[0.02em] text-black md:text-[40px]">
          {title}
        </h2>
        <p className="max-w-[549px] text-sm font-medium text-ink">{intro}</p>
      </div>

      {/* Cards */}
      <div className="mx-auto mt-12 flex w-full max-w-[951px] flex-col gap-6 md:mt-20">
        {cards.map((card, i) => {
          const cardTitle = card.title ?? FALLBACK_CARDS[i % FALLBACK_CARDS.length].title
          const location = card.location ?? 'Montfoort'
          const hours = card.hours ?? 'Voltijd of deeltijd'
          const text = card.text ?? FALLBACK_CARDS[i % FALLBACK_CARDS.length].text
          const linkLabel = card.link?.label || 'Bekijk vacature'
          const linkUrl = hrefFor(card.link)

          return (
            <article
              key={('id' in card && card.id) || i}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#eae9e6] bg-white transition-colors hover:border-transparent hover:bg-brand md:flex-row md:items-stretch md:gap-10"
            >
              {/* Soft shine, revealed on hover along with the teal fill */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_120%_at_85%_-20%,rgba(255,255,255,0.25),transparent_60%)] opacity-0 transition-opacity group-hover:opacity-100"
              />

              {/* Whole-card link overlay: makes the entire card clickable while
                  keeping a single, screen-reader-friendly link. The visible arrow
                  below is decorative (aria-hidden). */}
              <Link
                href={linkUrl}
                target={card.link?.newTab ? '_blank' : undefined}
                rel={card.link?.newTab ? 'noopener noreferrer' : undefined}
                aria-label={`${linkLabel}: ${cardTitle}`}
                className="absolute inset-0 z-10 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              />

              {/* Photo */}
              <div className="relative h-48 shrink-0 sm:h-56 md:h-auto md:w-60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={CARD_IMAGES[i % CARD_IMAGES.length]}
                  alt=""
                  className="absolute inset-0 h-full w-full rounded-2xl object-cover"
                />
              </div>

              {/* Content */}
              <div className="relative flex min-w-0 flex-1 flex-col items-start gap-4 p-6 md:px-0 md:py-8">
                <div className="flex flex-wrap items-center gap-3 md:gap-5">
                  <Tag icon="location" label={location} />
                  <Tag icon="clock" label={hours} />
                </div>
                <h3 className="text-lg font-bold leading-6 tracking-[-0.01em] text-[#000135] transition-colors group-hover:text-white md:text-xl">
                  {cardTitle}
                </h3>
                <p className="max-w-[520px] text-sm font-medium leading-5 tracking-[-0.01em] text-[#000135]/80 transition-colors group-hover:text-white/80">
                  {text}
                </p>
              </div>

              {/* Arrow (decorative — the whole card is the link above) */}
              <div className="relative flex items-start px-6 pb-6 md:py-8 md:pl-4 md:pr-8">
                <span
                  aria-hidden
                  className="inline-flex size-12 items-center justify-center rounded-full border border-transparent bg-brand text-white transition-colors group-hover:border-white/60 group-hover:bg-transparent"
                >
                  <ArrowIcon className="h-2.5 w-3" />
                </span>
              </div>
            </article>
          )
        })}

        {/* Open application hint */}
        <p className="flex flex-wrap items-center justify-center gap-1.5 py-6 text-center text-base font-medium tracking-[-0.01em] text-[#000135]">
          Lijkt het jouw leuk om bij ons te komen werken? Stuur een{' '}
          <Link
            href="#contact"
            className="inline-flex items-center gap-1.5 text-brand transition-colors hover:text-[#3fadb7]"
          >
            open sollicitatie
            <ArrowIcon />
          </Link>
        </p>
      </div>
    </Section>
  )
}
