import type { Page } from '@/payload-types'

import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Icon } from '@/components/frontend/ui/Icon'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'complaints' }>

const FALLBACK_STEPS = [
  {
    title: 'Maak uw klacht bespreekbaar',
    text: 'Praat met uw zorgverlener over uw klacht, misschien kunt u het samen oplossen.',
  },
  {
    title: 'Klacht indienen',
    text: 'Stuur Klachtenportaal Zorg (KPZ) uw klacht. KPZ leest uw klacht en, als uw zorgaanbieder aangesloten is bij KPZ, neemt een klachtenfunctionaris contact met u op.',
  },
  {
    title: 'Klachtbrief maken',
    text: 'De klachtenfunctionaris beschrift uw klacht in de klachtbrief, deze wordt, na uw akkoord, aan de zorgaanbieder gestuurd. De zorgaanbieder reageert naar de klachtenfunctionaris. Deze bespreekt de reactie met u.',
  },
  {
    title: 'Reactie zorgaanbieder',
    text: 'De zorgaanbieder schrijft alle gemaakte afspraken op in een brief. De klachtenfunctionaris schrift een afsluitende brief.',
  },
]

/** Small curved teal arrow drawn between step cards (decorative, desktop only). */
function CurvedArrow({ flipped }: { flipped?: boolean }) {
  return (
    <svg
      width="46"
      height="48"
      viewBox="0 0 46 48"
      fill="none"
      aria-hidden="true"
      className={flipped ? '-scale-x-100' : undefined}
    >
      <path
        d="M6 2C28 10 40 22 36 42"
        stroke="#51c2cc"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
        fill="none"
      />
      <path
        d="M29 37l7 9 7.5-7"
        stroke="#51c2cc"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
        fill="none"
      />
    </svg>
  )
}

/**
 * "Klachtenregeling" section: intro column on the left, a vertical stepper
 * rail with a "Stap 1" pill, and numbered step cards on the right. The first
 * step is highlighted as a teal card; the rest are white outlined cards.
 */
export function Complaints(props: Props) {
  const eyebrow = props.header?.eyebrow ?? 'Stap voor stap'
  const title = props.header?.title ?? 'Klachtenregeling'
  const intro =
    props.header?.intro ??
    'Hieronder de klachtenprocedure Wkkgz in het kort. Op de achterzijde vindt u meer toelichting.'
  const steps = props.steps?.length ? props.steps : FALLBACK_STEPS

  return (
    <Section className="bg-white">
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-8">
        {/* Intro column */}
        <div className="flex flex-col items-start gap-6 lg:w-[360px] lg:shrink-0 xl:w-[420px]">
          <span className="inline-flex items-center gap-2.5 rounded-pill bg-brand/5 px-3 py-2.5 text-brand">
            <Icon name={props.header?.icon} size={14} />
            <Eyebrow>{eyebrow}</Eyebrow>
          </span>
          <h2 className="font-sans text-3xl font-semibold leading-[1.2] tracking-[0.02em] text-black md:text-[40px]">
            {title}
          </h2>
          <p className="whitespace-pre-line text-sm font-medium text-ink">{intro}</p>
        </div>

        {/* Stepper rail (desktop only) */}
        <div className="hidden shrink-0 flex-col items-center lg:flex" aria-hidden="true">
          <div className="h-[82px] w-px bg-brand/30" />
          <div className="rounded-pill bg-[#e5f6f7] px-4 py-2 text-center text-xl font-bold text-brand">
            Stap 1
          </div>
          <div className="w-px flex-1 bg-[#eae9e6]" />
        </div>

        {/* Step cards */}
        <div className="flex flex-1 flex-col gap-12 lg:max-w-[660px]">
          {steps.map((step, i) => {
            const first = i === 0
            const last = i === steps.length - 1
            return (
              <article
                key={('id' in step && step.id) || i}
                className={
                  first
                    ? 'relative rounded-3xl border border-[#f4f4f3] bg-brand bg-[linear-gradient(135deg,#7ed6dd_0%,#51c2cc_55%,#3fb0ba_100%)] p-8'
                    : 'relative rounded-3xl border border-[#eae9e6] bg-white p-8'
                }
              >
                <div className="flex flex-col gap-4">
                  <h3
                    className={`text-xl font-bold leading-6 tracking-[-0.01em] ${
                      first ? 'text-white' : 'text-brand'
                    }`}
                  >
                    {i + 1}. {step.title ?? ''}
                  </h3>
                  {step.text && (
                    <p
                      className={`whitespace-pre-line text-sm font-medium leading-5 tracking-[-0.01em] ${
                        first ? 'text-white/80' : 'text-black/80'
                      }`}
                    >
                      {step.text}
                    </p>
                  )}
                </div>
                {!last && (
                  <div
                    className={`pointer-events-none absolute top-full hidden h-12 items-center md:flex ${
                      i % 2 === 0 ? 'right-16' : 'left-16'
                    }`}
                  >
                    <CurvedArrow flipped={i % 2 === 1} />
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

export default Complaints
