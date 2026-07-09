import type { Page } from '@/payload-types'

import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'visionMission' }>

const DEFAULT_TITLE = 'Waar wij in geloven, en hoe wij daar naar toe werken'

const DEFAULT_ITEMS: { heading: string; body?: string }[] = [
  {
    heading: 'Onze visie',
    body: 'Buro J.A.Z.Z. gelooft in een inclusieve samenleving waarin iedereen op een gezonde manier kan deelnemen. Iedereen staat in verbinding met zichzelf en de ander, vrij van belemmerende ervaringen of beperkingen.',
  },
  { heading: 'Onze missie' },
]

/** Outlined star (line-md:star) — inherits color via currentColor. */
function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 19.3 19.3"
      width="20"
      height="20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M9.64996 2.41261L7.76016 7.04462L2.76627 7.41454L6.59412 10.6473L5.39591 15.5045L9.64996 12.8668M9.64996 2.41261L11.5398 7.04462L16.5336 7.41454L12.7058 10.6473L13.904 15.5045L9.64996 12.8668"
        stroke="currentColor"
        strokeWidth="1.60834"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Handshake (fa7-regular:handshake) — inherits color via currentColor. */
function HandshakeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="20"
      height="20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M18.6906 4.35625C19.025 4.1125 19.1 3.64375 18.8563 3.30938C18.6125 2.975 18.1438 2.9 17.8094 3.14375L15.4812 4.8375L15.1719 4.63125C14.5562 4.21875 13.8312 4 13.0906 4H6.74062C5.90625 4 5.1 4.27813 4.44688 4.78438L2.19062 3.14375C1.85625 2.9 1.3875 2.975 1.14375 3.30938C0.9 3.64375 0.975 4.1125 1.30938 4.35625L4.05937 6.35625C4.35937 6.57187 4.76875 6.54063 5.03125 6.28125L5.15312 6.15938C5.575 5.7375 6.14688 5.5 6.74375 5.5H8.19063L5.325 8.36563C4.8375 8.85313 4.8375 9.64375 5.325 10.1344L5.35 10.1594C6.8125 11.625 9.1875 11.625 10.6531 10.1594L11.5 9.3125L14.5562 12.3687C15.0437 12.8562 15.0437 13.6469 14.5562 14.1375L14.25 14.4438L13.2812 13.475C12.9875 13.1813 12.5125 13.1813 12.2219 13.475C11.9312 13.7688 11.9281 14.2437 12.2219 14.5344L13.0969 15.4094C12.55 15.7344 11.9344 15.9312 11.2969 15.9875L9.78125 14.4687C9.4875 14.175 9.0125 14.175 8.72188 14.4687C8.43125 14.7625 8.42813 15.2375 8.72188 15.5281L9.19062 15.9969H9.07187C7.94375 15.9969 6.8625 15.55 6.06563 14.7531L2.03125 10.7188C1.7375 10.425 1.2625 10.425 0.971875 10.7188C0.68125 11.0125 0.678125 11.4875 0.971875 11.7781L5.00625 15.8156C6.08437 16.8937 7.54687 17.5 9.07187 17.5H10.6906L10.7219 17.5312L10.7531 17.5H10.9312C12.4562 17.5 13.9187 16.8937 14.9969 15.8156L15.6187 15.1938C15.6562 15.1563 15.6906 15.1219 15.725 15.0844C15.7469 15.0688 15.7656 15.05 15.7844 15.0312L19.0312 11.7812C19.325 11.4875 19.325 11.0125 19.0312 10.7219C18.7375 10.4313 18.2625 10.4281 17.9719 10.7219L16.2906 12.4031C16.1594 12.0031 15.9375 11.625 15.6187 11.3062L12.0312 7.71875C11.7375 7.425 11.2625 7.425 10.9719 7.71875L9.59375 9.09688C8.76562 9.925 7.45313 9.97188 6.57188 9.24063L9.65625 6.15625C10.075 5.7375 10.6437 5.5 11.2375 5.49687H13.0969C13.5406 5.49687 13.975 5.62812 14.3437 5.875L15.0844 6.375C15.3469 6.55 15.6875 6.54062 15.9406 6.35625L18.6906 4.35625Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Small rocket (streamline:startup) used in the eyebrow pill. */
function RocketIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 13.9979 13.9979"
      width="14"
      height="14"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M5.71001 4.30786C3.79001 2.99786 2.00001 3.99786 0.500008 5.53786L3.82001 7.53786M9.69001 8.28786C11 10.2079 10 11.9979 8.46001 13.4979L6.46001 10.1779"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.28001 5.01786L8.98001 8.71786M3.82001 7.52786L6.47001 10.1779C8.59001 8.90786 11 7.67786 12.1 6.53786C14.48 4.15786 13.1 0.897864 13.1 0.897864C13.1 0.897864 9.84001 -0.482136 7.46001 1.89786C6.32001 2.99786 5.08001 5.41786 3.82001 7.52786Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 3.99786C10.6326 3.99786 10.7598 3.94519 10.8536 3.85142C10.9473 3.75765 11 3.63047 11 3.49786C11 3.36526 10.9473 3.23808 10.8536 3.14431C10.7598 3.05054 10.6326 2.99786 10.5 2.99786C10.3674 2.99786 10.2402 3.05054 10.1465 3.14431C10.0527 3.23808 10 3.36526 10 3.49786C10 3.63047 10.0527 3.75765 10.1465 3.85142C10.2402 3.94519 10.3674 3.99786 10.5 3.99786ZM3.68001 12.4379C3.10001 12.9979 0.500008 13.4979 0.500008 13.4979C0.500008 13.4979 1.00001 10.8979 1.56001 10.3179C1.7671 10.0965 2.03637 9.94297 2.33238 9.87758C2.6284 9.81218 2.93727 9.83794 3.21836 9.95148C3.49945 10.065 3.73957 10.261 3.90711 10.5137C4.07466 10.7663 4.16178 11.0638 4.15701 11.3669"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const ITEM_ICONS = [StarIcon, HandshakeIcon]

/**
 * "Visie en missie" section: eyebrow pill + 40px heading above an accordion
 * of belief cards (open card is teal with white text, closed cards are white),
 * with a rounded photo on the right. Server component — the accordion uses
 * native <details>/<summary>, so it stays static-export-safe without JS.
 */
export function VisionMission(props: Props) {
  const title = props.header?.title ?? DEFAULT_TITLE
  const rawItems = props.items && props.items.length > 0 ? props.items : DEFAULT_ITEMS
  const items = rawItems.map((item, i) => ({
    heading: item.heading ?? DEFAULT_ITEMS[i]?.heading ?? '',
    body: item.body ?? DEFAULT_ITEMS[i]?.body,
    key: ('id' in item && item.id) || `vm-item-${i}`,
  }))

  return (
    <Section py="py-16 md:py-[120px]">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
        {/* Text + accordion column */}
        <div className="flex w-full flex-col items-start gap-6 lg:max-w-[568px] lg:shrink-0">
          <span className="inline-flex items-center justify-center gap-2.5 rounded-pill bg-brand/5 px-3 py-2.5 text-brand">
            <RocketIcon />
            <Eyebrow>{props.header?.eyebrow ?? 'Visie en missie'}</Eyebrow>
          </span>

          <h2 className="font-sans text-[28px] leading-[1.2] font-semibold tracking-[0.02em] text-black md:text-[40px]">
            {title}
          </h2>

          <div className="flex w-full flex-col gap-5">
            {items.map((item, i) => {
              const Icon = ITEM_ICONS[i % ITEM_ICONS.length]
              return (
                <details
                  key={item.key}
                  open={i === 0}
                  className="group w-full rounded-[24px] border border-ink/5 bg-white p-6 transition-colors open:bg-brand"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-6 group-open:flex-col group-open:items-start [&::-webkit-details-marker]:hidden">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-white group-open:bg-white group-open:text-brand">
                      <Icon />
                    </span>
                    <span className="text-xl font-bold text-ink group-open:text-white">
                      {item.heading}
                    </span>
                  </summary>
                  {item.body && (
                    <p className="pt-2 text-sm leading-[1.6] font-medium whitespace-pre-line text-white">
                      {item.body}
                    </p>
                  )}
                </details>
              )
            })}
          </div>
        </div>

        {/* Photo column */}
        <div className="w-full min-w-0 lg:flex-1 lg:self-stretch">
          <img
            src="/images/vision-mission/photo.png"
            alt="Kind doet een handstand op een dikke mat in een gymzaal"
            className="aspect-[4/5] w-full rounded-[24px] object-cover shadow-[0px_3px_16px_0px_rgba(0,0,0,0.1)] sm:aspect-[4/3] lg:aspect-auto lg:h-[632px]"
          />
        </div>
      </div>
    </Section>
  )
}

export default VisionMission
