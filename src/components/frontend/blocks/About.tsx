import type { Page } from '@/payload-types'

import { Button } from '@/components/frontend/ui/Button'
import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'about' }>

const DEFAULT_TITLE = 'Ook Buro J.A.Z.Z heeft goede zorg nodig'

const DEFAULT_BODY_HIGHLIGHT = 'Jeugdhulp en Ambulante Zorg met Zorgzaamheid'

const DEFAULT_BODY_P2 =
  'De raad van toezicht bewaakt daarbij de koers: zij houdt onafhankelijk toezicht, adviseert het bestuur en fungeert als kritische sparringpartner. Samen met de inspraak van cliënten en medewerkers vormt dit de basis voor de goede zorg die wij elke dag willen blijven leveren.'

/** Small "people" glyph shown inside the eyebrow pill. */
function PeopleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="text-brand"
    >
      <circle cx="5.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="10.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M2 12.5c0-1.933 1.567-3.5 3.5-3.5h5c1.933 0 3.5 1.567 3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Envelope glyph inside the teal circle of the e-mail card. */
function MailIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="white" strokeWidth="1.5" />
      <path
        d="M3 7l9 6 9-6"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * "Wie wij zijn" section: photo left (with overlapping e-mail contact card),
 * eyebrow pill + title + body copy + CTAs right. Stacks on mobile.
 */
export function About(props: Props) {
  const eyebrow = props.eyebrow ?? 'Wie wij zijn'
  const title = props.title ?? DEFAULT_TITLE
  const email = props.email ?? 'contact@burojazz.nl'
  const ctaLabel = props.ctaLabel ?? 'Direct aanmelden'

  const bodyParagraphs = props.body
    ? props.body.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
    : null

  return (
    <Section id="wie-wij-zijn" py="py-16 md:pt-28 md:pb-36">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        {/* Photo with overlapping e-mail card */}
        <div className="relative mb-20 lg:mb-0">
          <img
            src="/images/about/directors.jpg"
            alt="Medewerker van Buro J.A.Z.Z. met een basketbal"
            className="h-[420px] w-full rounded-photo object-cover shadow-[0px_3px_16px_0px_rgba(0,0,0,0.1)] sm:h-[520px] lg:h-[632px]"
          />
          <a
            href={`mailto:${email}`}
            className="absolute -bottom-14 left-4 flex items-center gap-6 rounded-3xl border border-ink/5 bg-white px-7 py-6 shadow-[0px_3px_16px_0px_rgba(0,0,0,0.08)] sm:left-10"
          >
            <span className="flex size-[65px] shrink-0 items-center justify-center rounded-full bg-brand">
              <MailIcon />
            </span>
            <span className="flex flex-col gap-2">
              <span className="text-lg font-bold tracking-[-0.03em] text-[#091b38] sm:text-xl">
                {email}
              </span>
              <span className="text-sm font-medium text-ink">Stuur ons een e-mail</span>
            </span>
          </a>
        </div>

        {/* Text column */}
        <div className="flex flex-col items-start gap-10 lg:gap-12">
          <div className="flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2.5 rounded-pill bg-brand/5 px-3 py-2.5">
              <PeopleIcon />
              <Eyebrow>{eyebrow}</Eyebrow>
            </div>
            <h2 className="max-w-[568px] font-sans text-[28px] leading-[1.2] font-semibold tracking-[0.02em] text-black sm:text-[32px] lg:text-[40px]">
              {title}
            </h2>
            <div className="flex max-w-[549px] flex-col gap-[1.6em] text-sm leading-[1.6] font-medium text-ink">
              {bodyParagraphs ? (
                bodyParagraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)
              ) : (
                <>
                  <p>
                    Andres en Egbert zijn de bestuurders van Stichting Buro J.A.Z.Z. Vanuit de
                    kern van waar Buro J.A.Z.Z. voor staat –{' '}
                    <span className="text-brand">{DEFAULT_BODY_HIGHLIGHT}</span> – zetten zij
                    zich dagelijks in voor kwalitatieve en verantwoorde zorg. Met hun jarenlange
                    ervaring als jeugdhulpverleners staan zij dicht bij de praktijk en
                    ondersteunen zij begeleiders en behandelaren in hun werk.
                  </p>
                  <p>{DEFAULT_BODY_P2}</p>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Button label={ctaLabel} href="/aanmelden" />
            <Button label="Neem contact op" href="/contact" variant="secondary" />
          </div>
        </div>
      </div>
    </Section>
  )
}
