import type { Page } from '@/payload-types'

import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Icon } from '@/components/frontend/ui/Icon'
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

/** Default per-item icon (used when the item has no CMS icon set). */
const DEFAULT_ITEM_ICONS = ['IconStar', 'IconHeartHandshake']

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
    icon: 'icon' in item ? item.icon : undefined,
    key: ('id' in item && item.id) || `vm-item-${i}`,
  }))

  return (
    <Section py="py-16 md:py-[120px]">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
        {/* Text + accordion column */}
        <div className="flex w-full flex-col items-start gap-6 lg:max-w-[568px] lg:shrink-0">
          <span className="inline-flex items-center justify-center gap-2.5 rounded-pill bg-brand/5 px-3 py-2.5 text-brand">
            <Icon name={props.header?.icon} fallback="IconRocket" size={14} />
            <Eyebrow>{props.header?.eyebrow ?? 'Visie en missie'}</Eyebrow>
          </span>

          <h2 className="font-sans text-[28px] leading-[1.2] font-semibold tracking-[0.02em] text-black md:text-[40px]">
            {title}
          </h2>

          <div className="flex w-full flex-col gap-5">
            {items.map((item, i) => {
              return (
                <details
                  key={item.key}
                  open={i === 0}
                  className="group w-full rounded-[24px] border border-ink/5 bg-white p-6 transition-colors open:bg-brand"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-6 group-open:flex-col group-open:items-start [&::-webkit-details-marker]:hidden">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-white group-open:bg-white group-open:text-brand">
                      <Icon
                        name={item.icon}
                        fallback={DEFAULT_ITEM_ICONS[i % DEFAULT_ITEM_ICONS.length]}
                        size={20}
                      />
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
