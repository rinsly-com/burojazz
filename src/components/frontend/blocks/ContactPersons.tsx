import type { Page } from '@/payload-types'

import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Icon } from '@/components/frontend/ui/Icon'
import { Media, resolveMedia, type MediaResource } from '@/components/frontend/ui/Media'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'contactPersons' }>

/** Default people from the design; used when the block has no people yet. */
const DEFAULT_PEOPLE = [
  { name: 'Egbert de Boer', role: 'Bestuurder' },
  { name: 'Andres van Eeten', role: 'Bestuurder' },
]

/** Circular white icon button linking to a phone/email; nothing when unset. */
function ContactButton({
  href,
  icon,
  label,
}: {
  href: string | null
  icon: string
  label: string
}) {
  if (!href) return null
  return (
    <a
      href={href}
      aria-label={label}
      className="flex size-16 items-center justify-center rounded-full bg-white text-brand transition-transform hover:scale-105"
    >
      <Icon fallback={icon} size={24} />
    </a>
  )
}

function PersonCard({
  name,
  role,
  photo,
  phone,
  email,
}: {
  name: string
  role: string
  photo: MediaResource
  phone: string | null
  email: string | null
}) {
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null
  const mailHref = email ? `mailto:${email}` : null
  const hasPhoto = !!resolveMedia(photo)?.url

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

      {/* Portrait fills the card frame (object-cover). The frame is a touch
          wider than the photo, so cover overflows vertically; anchor the crop to
          the top (object-position) so the subject's head stays in frame while
          the lower body fades into the teal below. Overrides the focal point,
          which Payload always stores at 50/50 here and would clip the head. */}
      <div className="absolute inset-x-0 bottom-0 top-[120px]">
        {hasPhoto ? (
          <Media
            resource={photo}
            alt={name}
            className="absolute inset-0 size-full"
            style={{ objectPosition: 'center top' }}
          />
        ) : (
          <div className="absolute inset-x-10 bottom-0 top-8 rounded-t-[160px] bg-white/15" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand/0 from-[44%] to-brand" />
      </div>

      {/* Contact buttons: phone (tel:) and email (mailto:) */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-6">
        <ContactButton href={telHref} icon="IconPhone" label={`Bel ${name}`} />
        <ContactButton href={mailHref} icon="IconMail" label={`E-mail ${name}`} />
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
          {people.map((person, i) => {
            const p = person as {
              name?: string | null
              role?: string | null
              photo?: MediaResource
              phone?: string | null
              email?: string | null
              id?: string | null
            }
            return (
              <PersonCard
                key={p.id || `${p.name}-${i}`}
                name={p.name ?? DEFAULT_PEOPLE[i % DEFAULT_PEOPLE.length].name}
                role={p.role ?? 'Bestuurder'}
                photo={p.photo}
                phone={p.phone ?? null}
                email={p.email ?? null}
              />
            )
          })}
        </div>
      </div>
    </Section>
  )
}

export default ContactPersons
