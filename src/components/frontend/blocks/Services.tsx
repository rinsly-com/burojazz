import type { Page } from '@/payload-types'
import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Icon } from '@/components/frontend/ui/Icon'
import { Section } from '@/components/frontend/ui/Section'

import { ServicesTabs, type TabData } from './ServicesTabs'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'services' }>

const DEFAULT_TABS: TabData[] = [
  {
    label: 'Behandeling',
    cards: [
      {
        number: '01',
        title: 'Cognitieve Gedragstherapie (CGT)',
        description:
          'Korte, doelgerichte behandeling om negatieve denk- en gedragspatronen te veranderen.',
      },
      {
        number: '02',
        title: 'Trauma behandeling',
        description: 'Hulp bij het verwerken van ingrijpende ervaringen in een veilige setting.',
      },
      {
        number: '03',
        title: 'Systeemtherapie',
        description: 'Behandeling die relaties en gezinsdynamiek centraal stelt.',
      },
      {
        number: '04',
        title: 'Psychomotore Therapie (PMT)',
        description: 'Therapie gericht op lichaam, gedrag en emotie via beweging en ervaring.',
      },
      {
        number: '05',
        title: 'Theraplay',
        description: 'Speelse therapie om de band tussen ouder en kind te verbeteren.',
      },
    ],
  },
  {
    label: 'Begeleiding',
    cards: [
      {
        number: '01',
        title: 'Ambulante begeleiding',
        description: 'Persoonlijke ondersteuning thuis en in de eigen omgeving van de jeugdige.',
      },
      {
        number: '02',
        title: 'Gezinsbegeleiding',
        description: 'Praktische en pedagogische ondersteuning voor het hele gezin.',
      },
      {
        number: '03',
        title: 'Individuele coaching',
        description: 'Doelgerichte begeleiding om vaardigheden en zelfstandigheid te versterken.',
      },
    ],
  },
  {
    label: 'Diagnostiek & Consultatie',
    cards: [
      {
        number: '01',
        title: 'Psychodiagnostisch onderzoek',
        description: 'Onderzoek naar cognitief, sociaal en emotioneel functioneren.',
      },
      {
        number: '02',
        title: 'Consultatie & advies',
        description: 'Inhoudelijk advies aan ouders, scholen en verwijzers.',
      },
    ],
  },
  {
    label: 'Crisis & Verblijf',
    cards: [
      {
        number: '01',
        title: 'Crisisopvang',
        description: 'Directe, veilige opvang wanneer thuis wonen tijdelijk niet kan.',
      },
      {
        number: '02',
        title: 'Verblijf',
        description: 'Een huiselijke woonplek met begeleiding, gericht op herstel en perspectief.',
      },
    ],
  },
]

/**
 * "Hulpverleningsvormen" section: centered eyebrow pill + title, then a set of
 * clickable tabs (see ServicesTabs) that switch between each tab's numbered
 * teal service cards. The header is server-rendered (inlined icon SVG); the
 * tab switching is handled by the client ServicesTabs component.
 */
export function Services(props: Props) {
  const eyebrow = props.header?.eyebrow ?? 'Hulpverleningsvormen'
  const title =
    props.header?.title ??
    'Ambulante jeugdhulp en verblijf, gericht op behandeling en begeleiding.'
  const tabs: TabData[] = props.tabs?.length ? props.tabs : DEFAULT_TABS

  return (
    <Section py="py-16 md:py-[120px]" className="flex flex-col items-center gap-12 md:gap-20">
      <div className="flex max-w-[700px] flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2.5 rounded-pill bg-brand/5 px-3 py-2.5 text-brand">
          <Icon name={props.header?.icon} fallback="IconDiamond" size={14} />
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <h2 className="text-center text-[28px] font-semibold leading-[1.2] tracking-[0.02em] text-black md:text-[40px]">
          {title}
        </h2>
      </div>
      <ServicesTabs tabs={tabs} />
    </Section>
  )
}
