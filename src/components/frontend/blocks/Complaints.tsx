import type { Page } from '@/payload-types'

import { ComplaintsStepper, type Step } from '@/components/frontend/blocks/ComplaintsStepper'
import { Icon } from '@/components/frontend/ui/Icon'
import { Media } from '@/components/frontend/ui/Media'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'complaints' }>

type PillData = NonNullable<NonNullable<Props['steps']>[number]['infoPills']>[number]

/** Full-fidelity default matching the design; used when the block has no steps. */
const FALLBACK_STEPS: NonNullable<Props['steps']> = [
  {
    title: 'Maak uw klacht bespreekbaar',
    text: 'Praat met uw zorgverlener over uw klacht, misschien kunt u het samen oplossen.',
    infoPills: [
      {
        icon: 'IconHelpCircleFilled',
        tone: 'brand',
        text: 'Lukt het niet of wilt u liever niet met uw zorgaanbieder praten?',
      },
    ],
  },
  {
    title: 'Klacht indienen',
    text: 'Stuur Klachtenportaal Zorg (KPZ) uw klacht. KPZ leest uw klacht en, als uw zorgaanbieder aangesloten is bij KPZ, neemt een klachtenfunctionaris contact met u op.',
  },
  {
    title: 'Klachtbrief maken',
    text: 'De klachtenfunctionaris beschrift uw klacht in de klachtbrief, deze wordt, na uw akkoord, aan de zorgaanbieder gestuurd. De zorgaanbieder reageert naar de klachtenfunctionaris. Deze bespreekt de reactie met u.',
    infoPills: [
      {
        icon: 'IconExclamationMark',
        tone: 'brand',
        text: 'U kunt nog met uw zorgverlener praten waar de klachtenfunctionaris bij is. Dit bemiddelingsgesprek is gewenst, niet verplicht!',
      },
    ],
  },
  {
    title: 'Reactie zorgaanbieder',
    text: 'De zorgaanbieder schrijft alle gemaakte afspraken op in een brief. De klachtenfunctionaris schrift een afsluitende brief.',
    infoPills: [
      {
        icon: 'IconCheck',
        tone: 'brand',
        text: 'Bent u hiermee tevreden?',
        note: 'Dan is de klacht afgesloten.',
      },
      {
        icon: 'IconX',
        tone: 'danger',
        text: 'Is er nog geen goede oplossing geboden door de zorgaanbieder?',
        note: 'Dan kunt u stoppen met de procedure of met de brief van de zorgaanbieder naar Geschillencommissie KPZ.',
      },
    ],
  },
]

/** Build the client-ready step data, pre-rendering each pill icon on the server. */
function toStep(step: NonNullable<Props['steps']>[number], i: number): Step {
  const pills = (step.infoPills ?? []) as PillData[]
  return {
    key: String(('id' in step && step.id) || `step-${i}`),
    title: step.title ?? '',
    text: step.text ?? null,
    pills: pills.map((pill, j) => {
      const tone = pill.tone === 'danger' ? 'danger' : 'brand'
      return {
        key: String(('id' in pill && pill.id) || `pill-${i}-${j}`),
        tone,
        text: pill.text ?? '',
        note: pill.note ?? null,
        icon: (
          <Icon
            name={pill.icon}
            fallback={tone === 'danger' ? 'IconX' : 'IconInfoCircle'}
            size={18}
          />
        ),
      }
    }),
  }
}

/** "Nog vragen?" card shown below the steps (server-rendered, normal flow). */
function ContactCard({ contact }: { contact: NonNullable<Props['contact']> }) {
  const telHref = contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, '')}` : null
  const mailHref = contact.email ? `mailto:${contact.email}` : null

  return (
    <div className="mt-12 flex w-full items-center gap-4 rounded-3xl border border-[#eae9e6] bg-white p-4 lg:ml-auto lg:max-w-[660px]">
      <Media
        resource={contact.photo}
        alt={contact.title ?? ''}
        className="size-14 shrink-0 rounded-2xl"
        style={{ objectPosition: 'center top' }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-lg font-bold text-black">{contact.title}</p>
        {contact.subtitle && <p className="text-sm font-medium text-ink">{contact.subtitle}</p>}
      </div>
      <div className="flex shrink-0 gap-3">
        {mailHref && (
          <a
            href={mailHref}
            aria-label={`E-mail ${contact.title ?? ''}`}
            className="flex size-11 items-center justify-center rounded-full bg-brand/5 text-brand transition-transform hover:scale-105"
          >
            <Icon fallback="IconMail" size={20} />
          </a>
        )}
        {telHref && (
          <a
            href={telHref}
            aria-label={`Bel ${contact.title ?? ''}`}
            className="flex size-11 items-center justify-center rounded-full bg-brand/5 text-brand transition-transform hover:scale-105"
          >
            <Icon fallback="IconPhone" size={20} />
          </a>
        )}
      </div>
    </div>
  )
}

/**
 * "Klachtenregeling" section. The interactive pinned stepper lives in a thin
 * client component (ComplaintsStepper); the eyebrow and info-pill icons are
 * rendered here on the server and passed down as nodes, so the Tabler barrel
 * stays out of the client bundle (matching VisionMission).
 */
export function Complaints(props: Props) {
  const eyebrow = props.header?.eyebrow ?? 'Stap voor stap'
  const title = props.header?.title ?? 'Klachtenregeling'
  const intro =
    props.header?.intro ??
    'Hieronder de klachtenprocedure Wkkgz in het kort. Op de achterzijde vindt u meer toelichting.'
  const rawSteps = props.steps?.length ? props.steps : FALLBACK_STEPS
  const steps = rawSteps.map(toStep)
  const contact = props.contact?.title ? props.contact : null

  return (
    <Section className="bg-white">
      <ComplaintsStepper
        eyebrowIcon={<Icon name={props.header?.icon} fallback="IconLayoutGrid" size={14} />}
        eyebrow={eyebrow}
        title={title}
        intro={intro}
        steps={steps}
      />
      {contact && <ContactCard contact={contact} />}
    </Section>
  )
}

export default Complaints
