import type { Page } from '@/payload-types'
import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Icon } from '@/components/frontend/ui/Icon'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'coreValues' }>

/**
 * Icon artwork per core value. Offsets (dx/dy) and sizes come from the Figma
 * design, relative to the 64px teal circle behind each icon.
 */
type IconSpec = { src: string; w: number; h: number; dx: number; dy: number }

const ICONS: Record<string, IconSpec> = {
  zorgzaam: { src: '/images/core-values/zorgzaam.svg', w: 83, h: 63, dx: -10, dy: -12 },
  eerlijk: { src: '/images/core-values/eerlijk.svg', w: 64, h: 62, dx: 10, dy: -8 },
  presentie: { src: '/images/core-values/presentie.svg', w: 72, h: 62, dx: -4, dy: -9 },
  passendintegraal: { src: '/images/core-values/passend.svg', w: 76, h: 75, dx: -7, dy: -7 },
  aansluiten: { src: '/images/core-values/aansluiten.svg', w: 64, h: 65, dx: 4, dy: -7 },
  betrouwbaar: { src: '/images/core-values/betrouwbaar.svg', w: 69, h: 63, dx: -1, dy: -5 },
  voorbeeldfunctie: { src: '/images/core-values/voorbeeldfunctie.svg', w: 47, h: 72, dx: 8, dy: 7 },
  vernieuwend: { src: '/images/core-values/vernieuwend.svg', w: 104, h: 104, dx: -20, dy: -25 },
}

const FALLBACK_VALUES = [
  'Zorgzaam',
  'Eerlijk',
  'Presentie',
  'Passend & integraal',
  'Aansluiten',
  'Betrouwbaar',
  'Voorbeeldfunctie',
  'Vernieuwend',
]

/**
 * Desktop cluster slot per value (in contract order), positions in px within
 * the 998x929 cluster canvas from the Figma design.
 */
const SLOTS: { left: number; top: number }[] = [
  { left: 0, top: 508 }, // Zorgzaam
  { left: 0, top: 253 }, // Eerlijk
  { left: 741, top: 253 }, // Presentie
  { left: 224, top: 0 }, // Passend & integraal
  { left: 561, top: 0 }, // Aansluiten
  { left: 741, top: 468 }, // Betrouwbaar (highlighted)
  { left: 561, top: 760 }, // Voorbeeldfunctie
  { left: 224, top: 760 }, // Vernieuwend
]

const HIGHLIGHT_TEXT = 'Doen wat je zegt en zeggen wat je doet. Jij moet op ons kunnen vertrouwen.'

function normalize(label: string): string {
  return label.toLowerCase().replace(/[^a-z]/g, '')
}

function isHighlight(label: string): boolean {
  return normalize(label) === 'betrouwbaar'
}

/** Teal (or white, on the highlighted card) circle with the value's line-art icon. */
function ValueIcon({ label, highlight }: { label: string; highlight?: boolean }) {
  const icon = ICONS[normalize(label)]
  return (
    <div className="relative size-16 shrink-0">
      <div className={`size-16 rounded-full ${highlight ? 'bg-white' : 'bg-brand'}`} />
      {icon && (
        <img
          src={icon.src}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute max-w-none"
          style={{ left: icon.dx, top: icon.dy, width: icon.w, height: icon.h }}
        />
      )}
    </div>
  )
}

/** White cursor decoration shown on the highlighted card (desktop only). */
function CursorDecoration() {
  return (
    <img
      src="/images/core-values/cursor.svg"
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-[104px] hidden w-11 lg:block"
    />
  )
}

/** One value card. The highlighted card is teal, tilted and carries body copy. */
function ValueCard({ label, highlight }: { label: string; highlight: boolean }) {
  if (highlight) {
    return (
      <div className="relative w-[257px] -rotate-[5deg] overflow-hidden rounded-3xl border border-ink/5 bg-brand p-6 shadow-[-8px_8px_26px_rgba(81,194,204,0.2),-34px_33px_47px_rgba(81,194,204,0.15),-76px_74px_64px_rgba(81,194,204,0.1)]">
        <div className="flex flex-col gap-8">
          <ValueIcon label={label} highlight />
          <div className="flex flex-col gap-3 text-white">
            <p className="text-xl font-bold">{label}</p>
            <p className="text-sm font-medium">{HIGHLIGHT_TEXT}</p>
          </div>
        </div>
        <CursorDecoration />
      </div>
    )
  }

  return (
    <div className="w-[257px] overflow-hidden rounded-3xl border border-ink/5 bg-white p-6">
      <div className="flex flex-col gap-8">
        <ValueIcon label={label} />
        <p className="text-xl font-bold text-ink">{label}</p>
      </div>
    </div>
  )
}

/** Compact chip used on small screens: icon circle + label in a row. */
function ValueChip({ label, highlight }: { label: string; highlight: boolean }) {
  const icon = ICONS[normalize(label)]
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-ink/5 py-2.5 pl-2.5 pr-5 ${
        highlight ? 'bg-brand text-white' : 'bg-white text-ink'
      }`}
    >
      <div
        className={`relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full ${
          highlight ? 'bg-white' : 'bg-brand'
        }`}
      >
        {icon && (
          <img src={icon.src} alt="" aria-hidden="true" className="size-8 object-contain" />
        )}
      </div>
      <p className="text-sm font-bold">{label}</p>
    </div>
  )
}

/**
 * "Dit zijn onze kernwaarden" — cluster of value cards around the central
 * teal J.A.Z.Z. logo tile, on a soft teal full-bleed background.
 * Desktop recreates the Figma arrangement with positioned cards; small
 * screens fall back to a wrapped row of chips led by the logo tile.
 */
export function CoreValues(props: Props) {
  const title = props.header?.title ?? 'Dit zijn onze kernwaarden'
  const rawValues = props.values?.length
    ? props.values.map((v) => v.label ?? '')
    : FALLBACK_VALUES
  const values = rawValues.filter((label) => label !== '')

  const clustered = values.slice(0, SLOTS.length)
  const extras = values.slice(SLOTS.length)

  return (
    <div className="relative overflow-hidden bg-[#dcf3f5]">
      {/* Soft light glow, top right (decorative) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[15%] -top-64 h-[700px] w-[1000px] rounded-full bg-white/50 blur-3xl"
      />

      <Section py="py-16 md:py-24 xl:py-[120px]" className="relative">
        {/* Heading */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2.5 rounded-pill bg-brand/5 px-3 py-2.5 text-brand">
            <Icon name={props.header?.icon} fallback="IconHeart" size={14} />
            <Eyebrow>{props.header?.eyebrow ?? 'Over ons'}</Eyebrow>
          </div>
          <h2 className="font-sans text-3xl font-semibold tracking-[-0.8px] text-ink md:text-[40px] md:leading-[1.2]">
            {title}
          </h2>
        </div>

        {/* Small screens: logo tile first, then wrapped chips */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 lg:hidden">
          <img
            src="/images/core-values/logo.svg"
            alt="J.A.Z.Z. logo"
            className="mb-2 w-32 basis-full object-contain sm:mb-0 sm:basis-auto"
          />
          {values.map((label, i) => (
            <ValueChip key={i} label={label} highlight={isHighlight(label)} />
          ))}
        </div>

        {/* Desktop: clustered arrangement around the central logo.
            At lg the Section content box (~864px at a 1024px viewport) is
            narrower than the 998px cluster canvas, so render the cluster
            scaled down (864/998 ≈ 0.865) inside a wrapper sized to the scaled
            dimensions; from xl the content box (1120px) fits it at full size. */}
        <div className="mt-[100px] hidden lg:block">
          <div className="mx-auto h-[804px] w-[864px] xl:h-[929px] xl:w-[998px]">
            <div className="relative h-[929px] w-[998px] origin-top-left scale-[0.865] xl:scale-100">
              <img
                src="/images/core-values/logo.svg"
                alt="J.A.Z.Z. logo"
                className="absolute left-[322px] top-[287px] size-[354px]"
              />
              {clustered.map((label, i) => {
                const slot = SLOTS[i]
                return (
                  <div key={i} className="absolute" style={{ left: slot.left, top: slot.top }}>
                    <ValueCard label={label} highlight={isHighlight(label)} />
                  </div>
                )
              })}
            </div>
          </div>
          {extras.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              {extras.map((label, i) => (
                <ValueCard key={i} label={label} highlight={isHighlight(label)} />
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}

export default CoreValues
