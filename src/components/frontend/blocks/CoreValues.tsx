import type { Page } from '@/payload-types'
import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Icon } from '@/components/frontend/ui/Icon'
import { Media, mediaUrl } from '@/components/frontend/ui/Media'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'coreValues' }>

/** A single value with its (CMS-uploaded) icon resolved to a URL. */
type ValueItem = { label: string; description: string | null; iconUrl: string | null }

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
  { left: 741, top: 468 }, // Betrouwbaar
  { left: 561, top: 760 }, // Voorbeeldfunctie
  { left: 224, top: 760 }, // Vernieuwend
]

/**
 * Teal circle with the value's line-art icon. The icon overflows the 64px
 * circle (per the Figma design). On hover the card turns teal, so the circle
 * flips to white to keep the icon legible (driven by the card's `group`).
 */
function ValueIcon({ iconUrl }: { iconUrl: string | null }) {
  return (
    <div className="relative flex size-16 shrink-0 items-center justify-center rounded-full bg-brand transition-colors group-hover:bg-white">
      {iconUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={iconUrl}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 size-[72px] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
        />
      )}
    </div>
  )
}

/**
 * One value card. Default: plain white with icon + label. On hover it tilts,
 * turns teal, and reveals the value's description (CSS-only, no client JS).
 */
function ValueCard({ value }: { value: ValueItem }) {
  return (
    <div className="group w-[257px] overflow-hidden rounded-3xl border border-ink/5 bg-white p-6 transition-all duration-300 hover:-rotate-[5deg] hover:border-transparent hover:bg-brand hover:shadow-[-8px_8px_26px_rgba(81,194,204,0.2),-34px_33px_47px_rgba(81,194,204,0.15),-76px_74px_64px_rgba(81,194,204,0.1)]">
      <div className="flex flex-col gap-8">
        <ValueIcon iconUrl={value.iconUrl} />
        <div className="flex flex-col">
          <p className="text-xl font-bold text-ink transition-colors group-hover:text-white">
            {value.label}
          </p>
          {value.description && (
            <div className="grid grid-rows-[0fr] transition-all duration-300 group-hover:mt-3 group-hover:grid-rows-[1fr]">
              <p className="overflow-hidden text-sm font-medium text-white">{value.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Compact chip used on small screens: icon circle + label in a row. */
function ValueChip({ value }: { value: ValueItem }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-ink/5 bg-white py-2.5 pl-2.5 pr-5 text-ink">
      <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand">
        {value.iconUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.iconUrl} alt="" aria-hidden="true" className="size-8 object-contain" />
        )}
      </div>
      <p className="text-sm font-bold">{value.label}</p>
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
  const rawValues: ValueItem[] = props.values?.length
    ? props.values.map((v) => ({
        label: v.label ?? '',
        description: v.description ?? null,
        iconUrl: mediaUrl(v.image),
      }))
    : FALLBACK_VALUES.map((label) => ({ label, description: null, iconUrl: null }))
  const values = rawValues.filter((v) => v.label !== '')

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
          <Media
            resource={props.logo}
            fallbackSrc="/images/core-values/logo.svg"
            alt="J.A.Z.Z. logo"
            fit="contain"
            className="mb-2 w-32 basis-full sm:mb-0 sm:basis-auto"
          />
          {values.map((value, i) => (
            <ValueChip key={i} value={value} />
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
              <Media
                resource={props.logo}
                fallbackSrc="/images/core-values/logo.svg"
                alt="J.A.Z.Z. logo"
                fit="contain"
                className="absolute left-[322px] top-[287px] size-[354px]"
              />
              {clustered.map((value, i) => {
                const slot = SLOTS[i]
                return (
                  <div
                    key={i}
                    className="absolute hover:z-20"
                    style={{ left: slot.left, top: slot.top }}
                  >
                    <ValueCard value={value} />
                  </div>
                )
              })}
            </div>
          </div>
          {extras.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              {extras.map((value, i) => (
                <ValueCard key={i} value={value} />
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}

export default CoreValues
