import type { Page } from '@/payload-types'
import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Icon } from '@/components/frontend/ui/Icon'
import { Section } from '@/components/frontend/ui/Section'

import { ServicesTabs, type TabData } from './ServicesTabs'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'services' }>

/** Icon used in a card's white circle when the CMS leaves the field empty. */
const DEFAULT_CARD_ICON = 'IconHeartHandshake'

const DEFAULT_TABS: TabData[] = [
  {
    label: 'Behandeling',
    cards: [
      {
        number: '01',
        icon: 'IconBrain',
        title: 'Cognitieve Gedragstherapie (CGT)',
        description:
          'Korte, doelgerichte behandeling om negatieve denk- en gedragspatronen te veranderen.',
      },
      {
        number: '02',
        icon: 'IconHeartbeat',
        title: 'Trauma behandeling',
        description: 'Hulp bij het verwerken van ingrijpende ervaringen in een veilige setting.',
      },
      {
        number: '03',
        icon: 'IconUsersGroup',
        title: 'Systeemtherapie',
        description: 'Behandeling die relaties en gezinsdynamiek centraal stelt.',
      },
      {
        number: '04',
        icon: 'IconRun',
        title: 'Psychomotore Therapie (PMT)',
        description: 'Therapie gericht op lichaam, gedrag en emotie via beweging en ervaring.',
      },
      {
        number: '05',
        icon: 'IconMoodKid',
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
        icon: 'IconHome',
        title: 'Ambulante begeleiding',
        description: 'Persoonlijke ondersteuning thuis en in de eigen omgeving van de jeugdige.',
      },
      {
        number: '02',
        icon: 'IconUsers',
        title: 'Gezinsbegeleiding',
        description: 'Praktische en pedagogische ondersteuning voor het hele gezin.',
      },
      {
        number: '03',
        icon: 'IconUser',
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
        icon: 'IconClipboardText',
        title: 'Psychodiagnostisch onderzoek',
        description: 'Onderzoek naar cognitief, sociaal en emotioneel functioneren.',
      },
      {
        number: '02',
        icon: 'IconMessage2',
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
        icon: 'IconAlertTriangle',
        title: 'Crisisopvang',
        description: 'Directe, veilige opvang wanneer thuis wonen tijdelijk niet kan.',
      },
      {
        number: '02',
        icon: 'IconBed',
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

  // Render each card's icon here (server component) so the resolved Tabler SVG
  // is inlined into the static HTML — the client ServicesTabs just places the
  // node, keeping the icon barrel out of the shipped JS.
  const renderedTabs: TabData[] = tabs.map((tab) => ({
    ...tab,
    cards: (tab.cards ?? []).map((card) => ({
      ...card,
      iconNode: <Icon name={card.icon} fallback={DEFAULT_CARD_ICON} size={28} stroke={1.75} />,
    })),
  }))

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
      <ServicesTabs tabs={renderedTabs} />
    </Section>
  )
}
