import type { Page } from '@/payload-types'

import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Icon } from '@/components/frontend/ui/Icon'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'contactPersons' }>

/** Default people from the design; used when the block has no people yet. */
const DEFAULT_PEOPLE = [
  { name: 'Egbert de Boer', role: 'Bestuurder' },
  { name: 'Andres van Eeten', role: 'Bestuurder' },
]

/** Static portrait assets matched to card position (v1: images not in CMS). */
const PHOTOS = ['/images/contact-persons/egbert.png', '/images/contact-persons/andres.png']

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
          <Icon fallback="IconPhone" size={24} />
        </span>
        <span className="flex size-16 items-center justify-center rounded-full bg-white text-brand">
          <Icon fallback="IconMail" size={24} />
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
  const eyebrow = props.header?.eyebrow ?? 'Kom in contact'
  const title = props.header?.title ?? 'Jouw contactpersonen'
  const subtitle = props.header?.subtitle ?? 'Wij staan altijd voor u klaar.'
  const people = props.people?.length ? props.people : DEFAULT_PEOPLE

  return (
    <Section py="py-16 md:py-[120px]">
      <div className="flex flex-col items-center gap-12 md:gap-20">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="inline-flex items-center gap-2.5 rounded-pill bg-brand/5 px-3 py-2.5 text-brand">
            <Icon name={props.header?.icon} fallback="IconUsers" size={14} className="shrink-0" />
            <Eyebrow className="leading-none">{eyebrow}</Eyebrow>
          </span>
          <h2 className="max-w-[700px] text-[28px] font-semibold leading-[1.2] tracking-[0.02em] text-black md:text-[40px]">
            {title}
          </h2>
          <p className="max-w-[549px] text-sm font-medium text-ink">{subtitle}</p>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-6 md:flex-row md:flex-wrap md:items-stretch">
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
