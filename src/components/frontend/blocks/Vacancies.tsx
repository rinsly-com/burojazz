import Link from 'next/link'

import type { Page } from '@/payload-types'
import { ArrowIcon } from '@/components/frontend/ui/ArrowIcon'
import { hrefFor, type LinkFields } from '@/components/frontend/ui/CMSLink'
import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
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

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M8 8.67a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 14.67c2.67-2.67 5.33-5.06 5.33-8A5.33 5.33 0 0 0 2.67 6.67c0 2.94 2.66 5.33 5.33 8Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <circle cx="8" cy="8" r="6.67" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M8 4.67V8l2 2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="1.17"
        y="4.08"
        width="11.67"
        height="8.17"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M4.67 4.08V2.92A1.75 1.75 0 0 1 6.42 1.17h1.16a1.75 1.75 0 0 1 1.75 1.75v1.16"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M1.17 7h11.66"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Tag({
  icon,
  label,
  featured,
}: {
  icon: 'location' | 'clock'
  label: string
  featured: boolean
}) {
  const classes = featured
    ? 'bg-white/15 text-white'
    : 'bg-brand/5 text-brand'
  const Icon = icon === 'location' ? LocationIcon : ClockIcon
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-pill px-3 py-2 text-xs font-bold ${classes}`}
    >
      <Icon className="shrink-0" />
      {label}
    </span>
  )
}

/**
 * "Word onderdeel van ons team" — vacancy cards section.
 * First card is the featured teal variant; the rest are white with a hairline border.
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
          <BriefcaseIcon className="shrink-0" />
          <Eyebrow>Vacatures</Eyebrow>
        </span>
        <h2 className="max-w-[700px] text-3xl font-semibold leading-[1.2] tracking-[0.02em] text-black md:text-[40px]">
          {title}
        </h2>
        <p className="max-w-[549px] text-sm font-medium text-ink">{intro}</p>
      </div>

      {/* Cards */}
      <div className="mx-auto mt-12 flex w-full max-w-[951px] flex-col gap-6 md:mt-20">
        {cards.map((card, i) => {
          const featured = i === 0
          const cardTitle = card.title ?? FALLBACK_CARDS[i % FALLBACK_CARDS.length].title
          const location = card.location ?? 'Montfoort'
          const hours = card.hours ?? 'Voltijd of deeltijd'
          const text = card.text ?? FALLBACK_CARDS[i % FALLBACK_CARDS.length].text
          const linkLabel = card.link?.label || 'Bekijk vacature'
          const linkUrl = hrefFor(card.link)

          return (
            <article
              key={('id' in card && card.id) || i}
              className={`relative flex flex-col overflow-hidden rounded-3xl md:flex-row md:items-stretch md:gap-10 ${
                featured ? 'bg-brand' : 'border border-[#eae9e6] bg-white'
              }`}
            >
              {/* Soft shine on the featured card */}
              {featured && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_120%_at_85%_-20%,rgba(255,255,255,0.25),transparent_60%)]"
                />
              )}

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
                  <Tag icon="location" label={location} featured={featured} />
                  <Tag icon="clock" label={hours} featured={featured} />
                </div>
                <h3
                  className={`text-lg font-bold leading-6 tracking-[-0.01em] md:text-xl ${
                    featured ? 'text-white' : 'text-[#000135]'
                  }`}
                >
                  {cardTitle}
                </h3>
                <p
                  className={`max-w-[520px] text-sm font-medium leading-5 tracking-[-0.01em] ${
                    featured ? 'text-white/80' : 'text-[#000135]/80'
                  }`}
                >
                  {text}
                </p>
              </div>

              {/* Arrow link */}
              <div className="relative flex items-start px-6 pb-6 md:py-8 md:pl-4 md:pr-8">
                <Link
                  href={linkUrl}
                  target={card.link?.newTab ? '_blank' : undefined}
                  rel={card.link?.newTab ? 'noopener noreferrer' : undefined}
                  aria-label={`${linkLabel}: ${cardTitle}`}
                  className={`inline-flex size-12 items-center justify-center rounded-full transition-colors ${
                    featured
                      ? 'border border-white/60 text-white hover:bg-white/15'
                      : 'bg-brand text-white hover:bg-[#3fadb7]'
                  }`}
                >
                  <ArrowIcon className="h-2.5 w-3" />
                </Link>
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
