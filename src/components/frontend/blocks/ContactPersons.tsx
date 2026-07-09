import type { Page } from '@/payload-types'

import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'contactPersons' }>

/** Default people from the design; used when the block has no people yet. */
const DEFAULT_PEOPLE = [
  { name: 'Egbert de Boer', role: 'Bestuurder' },
  { name: 'Andres van Eeten', role: 'Bestuurder' },
]

/** Static portrait assets matched to card position (v1: images not in CMS). */
const PHOTOS = ['/images/contact-persons/egbert.png', '/images/contact-persons/andres.png']

function UserIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="12" cy="6" r="4" />
      <path d="M20 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S7.582 13 12 13s8 2.015 8 4.5Z" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function PersonCard({
  name,
  role,
  photo,
}: {
  name: string
  role: string
  photo?: string
}) {
  return (
    <div className="relative flex h-[530px] w-full max-w-[398px] flex-col items-center overflow-hidden rounded-[24px] bg-brand px-6 pb-6 pt-8">
      {/* Decorative brand blob, faded behind the portrait */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/contact-persons/blob.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -left-[59px] top-[96px] size-[293px] max-w-none opacity-20"
      />

      <div className="relative z-10 w-full text-center leading-[1.5] text-white">
        <p className="font-sans text-[26px] font-bold md:text-[32px]">{name}</p>
        <p className="text-sm font-medium">{role}</p>
      </div>

      {/* Portrait anchored to the card bottom, fading into the teal */}
      <div className="absolute inset-x-0 bottom-0 top-[133px]">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={name}
            className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
          />
        ) : (
          <div className="absolute inset-x-10 bottom-0 top-8 rounded-t-[160px] bg-white/15" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand/0 from-[44%] to-brand" />
      </div>

      {/* Contact icons (decorative in v1: the block has no phone/email fields) */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-6">
        <span className="flex size-16 items-center justify-center rounded-full bg-white text-brand">
          <PhoneIcon />
        </span>
        <span className="flex size-16 items-center justify-center rounded-full bg-white text-brand">
          <MailIcon />
        </span>
      </div>
    </div>
  )
}

/**
 * "Jouw contactpersonen" section: centered intro plus teal person cards
 * with a portrait fading into the card and phone/mail roundels.
 */
export function ContactPersons(props: Props) {
  const eyebrow = props.eyebrow ?? 'Kom in contact'
  const title = props.title ?? 'Jouw contactpersonen'
  const subtitle = props.subtitle ?? 'Wij staan altijd voor u klaar.'
  const people = props.people?.length ? props.people : DEFAULT_PEOPLE

  return (
    <Section py="py-16 md:py-[120px]">
      <div className="flex flex-col items-center gap-12 md:gap-20">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="inline-flex items-center gap-2.5 rounded-pill bg-brand/5 px-3 py-2.5 text-brand">
            <UserIcon />
            <Eyebrow className="leading-none">{eyebrow}</Eyebrow>
          </span>
          <h2 className="max-w-[700px] text-[28px] font-semibold leading-[1.2] tracking-[0.02em] text-black md:text-[40px]">
            {title}
          </h2>
          <p className="max-w-[549px] text-sm font-medium text-ink">{subtitle}</p>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-6 md:flex-row md:items-stretch">
          {people.map((person, i) => (
            <PersonCard
              key={('id' in person && person.id) || `${person.name}-${i}`}
              name={person.name ?? DEFAULT_PEOPLE[i % DEFAULT_PEOPLE.length].name}
              role={person.role ?? 'Bestuurder'}
              photo={PHOTOS[i]}
            />
          ))}
        </div>
      </div>
    </Section>
  )
}

export default ContactPersons
