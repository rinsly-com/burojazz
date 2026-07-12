import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Page } from '@/payload-types'

import { Button } from '@/components/frontend/ui/Button'
import { Buttons } from '@/components/frontend/ui/CMSLink'
import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Icon } from '@/components/frontend/ui/Icon'
import { Media } from '@/components/frontend/ui/Media'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'about' }>

const DEFAULT_TITLE = 'Ook Buro J.A.Z.Z heeft goede zorg nodig'

const DEFAULT_BODY_HIGHLIGHT = 'Jeugdhulp en Ambulante Zorg met Zorgzaamheid'

const DEFAULT_BODY_P2 =
  'De raad van toezicht bewaakt daarbij de koers: zij houdt onafhankelijk toezicht, adviseert het bestuur en fungeert als kritische sparringpartner. Samen met de inspraak van cliënten en medewerkers vormt dit de basis voor de goede zorg die wij elke dag willen blijven leveren.'

/**
 * "Wie wij zijn" section: photo left (with overlapping e-mail contact card),
 * eyebrow pill + title + body copy + CTAs right. Stacks on mobile.
 */
export function About(props: Props) {
  const eyebrow = props.header?.eyebrow ?? 'Wie wij zijn'
  const title = props.header?.title ?? DEFAULT_TITLE
  const email = props.email ?? 'contact@burojazz.nl'

  return (
    <Section id="wie-wij-zijn" py="py-16 md:pt-28 md:pb-36">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        {/* Photo with overlapping e-mail card */}
        <div className="relative mb-20 lg:mb-0">
          <Media
            resource={props.image}
            fallbackSrc="/images/about/directors.jpg"
            alt="Medewerker van Buro J.A.Z.Z. met een basketbal"
            className="h-[420px] w-full rounded-photo shadow-[0px_3px_16px_0px_rgba(0,0,0,0.1)] sm:h-[520px] lg:h-[632px]"
          />
          <a
            href={`mailto:${email}`}
            className="absolute -bottom-14 left-4 flex items-center gap-6 rounded-3xl border border-ink/5 bg-white px-7 py-6 shadow-[0px_3px_16px_0px_rgba(0,0,0,0.08)] sm:left-10"
          >
            <span className="flex size-[65px] shrink-0 items-center justify-center rounded-full bg-brand text-white">
              <Icon fallback="IconMail" size={24} stroke={1.5} />
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
            <div className="inline-flex items-center gap-2.5 rounded-pill bg-brand/5 px-3 py-2.5 text-brand">
              <Icon name={props.header?.icon} fallback="IconUsers" size={14} />
              <Eyebrow>{eyebrow}</Eyebrow>
            </div>
            <h2 className="max-w-[568px] font-sans text-[28px] leading-[1.2] font-semibold tracking-[0.02em] text-black sm:text-[32px] lg:text-[40px]">
              {title}
            </h2>
            <div className="flex max-w-[549px] flex-col gap-[1.6em] text-sm leading-[1.6] font-medium text-ink [&_a]:text-brand [&_a]:underline">
              {props.body ? (
                <RichText data={props.body} disableContainer />
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
          {props.buttons?.length ? (
            <Buttons buttons={props.buttons} />
          ) : (
            <div className="flex flex-wrap items-center gap-6">
              <Button label="Direct aanmelden" href="/aanmelden" />
              <Button label="Neem contact op" href="/contact" variant="secondary" />
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
