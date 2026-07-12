/**
 * Seed the Home page (all 9 layout blocks), publish it through the editorial
 * workflow, and seed the Header/Footer globals.
 *
 * Run with:  pnpm payload run scripts/seed-home.ts
 *
 * Idempotent: re-running updates the existing page/globals and re-publishes.
 * If the database has no users (fresh local DB), a dev admin is created:
 * dev@burojazz.local / burojazz-dev — change or replace it via /admin.
 */
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import config from '../src/payload.config'
import type { Page, User } from '../src/payload-types'

type Layout = NonNullable<Page['layout']>
type PayloadInstance = Awaited<ReturnType<typeof getPayload>>

const seedDir = path.dirname(fileURLToPath(import.meta.url))

// Core-value labels, their source icon SVG (uploaded to Media on seed), and an
// optional description revealed when the card is hovered. Only Betrouwbaar is
// seeded with copy (from the design); editors fill in the rest via the CMS.
const CORE_VALUE_ICONS: { label: string; file: string; description?: string }[] = [
  { label: 'Zorgzaam', file: 'zorgzaam.svg' },
  { label: 'Eerlijk', file: 'eerlijk.svg' },
  { label: 'Presentie', file: 'presentie.svg' },
  { label: 'Passend & integraal', file: 'passend.svg' },
  { label: 'Aansluiten', file: 'aansluiten.svg' },
  {
    label: 'Betrouwbaar',
    file: 'betrouwbaar.svg',
    description: 'Doen wat je zegt en zeggen wat je doet. Jij moet op ons kunnen vertrouwen.',
  },
  { label: 'Voorbeeldfunctie', file: 'voorbeeldfunctie.svg' },
  { label: 'Vernieuwend', file: 'vernieuwend.svg' },
]

// Contact persons: name/role, their portrait (uploaded to Media on seed), and
// the phone/email behind the card's contact buttons. Editors replace via CMS.
const CONTACT_PEOPLE: {
  name: string
  role: string
  file: string
  phone: string
  email: string
}[] = [
  {
    name: 'Egbert de Boer',
    role: 'Bestuurder',
    file: 'egbert-de-boer-avatar.png',
    phone: '+31 6 55202233',
    email: 'contact@burojazz.nl',
  },
  {
    name: 'Andres van Eeten',
    role: 'Bestuurder',
    file: 'andres-van-eeten-avatar.png',
    phone: '+31 6 55202233',
    email: 'contact@burojazz.nl',
  },
]

/**
 * Upload a file from public/ to the Media collection, reusing the existing doc
 * on re-run so seeding stays idempotent. `publicRelPath` is relative to the
 * project's public/ dir, e.g. `images/core-values/x.svg`.
 *
 * Matching is on `alt` (a stable, unique label the seed controls), NOT filename:
 * Payload renames a file on collision (`x.svg` -> `x-1.svg`), so a filename
 * lookup never matched the stored name and every run created a fresh duplicate.
 * Each distinct image has a distinct alt; where two callers share an alt it is
 * deliberately the same image, so they correctly share one media doc.
 */
async function upsertMedia(
  payload: PayloadInstance,
  user: User,
  publicRelPath: string,
  alt: string,
): Promise<number> {
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: alt } },
    limit: 1,
    depth: 0,
  })
  const found = existing.docs[0]
  if (found) return found.id as number
  const created = await payload.create({
    collection: 'media',
    data: { alt },
    filePath: path.join(seedDir, '../public', publicRelPath),
    user,
  })
  console.log(`Uploaded media ${path.basename(publicRelPath)} (id ${created.id})`)
  return created.id as number
}

// Buttons/links use the shared link shape. Internal pages for these routes
// don't exist yet, so they are seeded as external (relative) URLs — switch to
// type 'internal' + a page reference once the target pages exist.
const extLink = (label: string, url: string, variant: 'primary' | 'secondary' = 'primary') => ({
  label,
  variant,
  type: 'external' as const,
  url,
  newTab: false,
})

// Body copy uses the restricted `basicEditor` (see src/fields/basicEditor.ts):
// plain paragraphs with inline marks only. This builds the Lexical serialized
// state for one paragraph per string, no inline formatting.
const richBody = (...paragraphs: string[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      textFormat: 0,
      textStyle: '',
      children: [
        { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
      ],
    })),
  },
})

const layout: Layout = [
  {
    blockType: 'hero',
    header: {
      title: 'BURO J.A.Z.Z.',
      subtitle: 'Jeugdhulp en Ambulante Zorg met Zorgzaamheid',
      intro:
        'Wij bieden ambulante jeugdhulp en jeugdhulp met verblijf, gericht op behandeling en begeleiding.',
    },
    buttons: [
      extLink('Direct aanmelden', '/aanmelden', 'primary'),
      extLink('Neem contact op', '/contact', 'secondary'),
    ],
  },
  {
    blockType: 'services',
    header: {
      icon: 'IconDiamond',
      eyebrow: 'Hulpverleningsvormen',
      title: 'Ambulante jeugdhulp en verblijf, gericht op behandeling en begeleiding.',
    },
    tabs: [
      {
        label: 'Behandeling',
        cards: [
          {
            number: '01',
            title: 'Cognitieve Gedragstherapie (CGT)',
            description:
              'Korte, doelgerichte behandeling om negatieve denk- en gedragspatronen te veranderen.',
            link: extLink('Lees verder', '#', 'secondary'),
          },
          {
            number: '02',
            title: 'Trauma behandeling',
            description: 'Hulp bij het verwerken van ingrijpende ervaringen in een veilige setting.',
            link: extLink('Lees verder', '#', 'secondary'),
          },
          {
            number: '03',
            title: 'Systeemtherapie',
            description: 'Behandeling die relaties en gezinsdynamiek centraal stelt.',
            link: extLink('Lees verder', '#', 'secondary'),
          },
          {
            number: '04',
            title: 'Psychomotore Therapie (PMT)',
            description: 'Therapie gericht op lichaam, gedrag en emotie via beweging en ervaring.',
            link: extLink('Lees verder', '#', 'secondary'),
          },
          {
            number: '05',
            title: 'Theraplay',
            description: 'Speelse therapie om de band tussen ouder en kind te verbeteren.',
            link: extLink('Lees verder', '#', 'secondary'),
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
            link: extLink('Lees verder', '#', 'secondary'),
          },
          {
            number: '02',
            title: 'Gezinsbegeleiding',
            description: 'Praktische en pedagogische ondersteuning voor het hele gezin.',
            link: extLink('Lees verder', '#', 'secondary'),
          },
          {
            number: '03',
            title: 'Individuele coaching',
            description: 'Doelgerichte begeleiding om vaardigheden en zelfstandigheid te versterken.',
            link: extLink('Lees verder', '#', 'secondary'),
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
            link: extLink('Lees verder', '#', 'secondary'),
          },
          {
            number: '02',
            title: 'Consultatie & advies',
            description: 'Inhoudelijk advies aan ouders, scholen en verwijzers.',
            link: extLink('Lees verder', '#', 'secondary'),
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
            link: extLink('Lees verder', '#', 'secondary'),
          },
          {
            number: '02',
            title: 'Verblijf',
            description: 'Een huiselijke woonplek met begeleiding, gericht op herstel en perspectief.',
            link: extLink('Lees verder', '#', 'secondary'),
          },
        ],
      },
    ],
  },
  {
    blockType: 'about',
    header: {
      icon: 'IconUsers',
      eyebrow: 'Wie wij zijn',
      title: 'Ook Buro J.A.Z.Z heeft goede zorg nodig',
    },
    body: richBody(
      'Andres en Egbert zijn de bestuurders van Stichting Buro J.A.Z.Z. Vanuit de kern van waar Buro J.A.Z.Z. voor staat – Jeugdhulp en Ambulante Zorg met Zorgzaamheid – zetten zij zich dagelijks in voor kwalitatieve en verantwoorde zorg. Met hun jarenlange ervaring als jeugdhulpverleners staan zij dicht bij de praktijk en ondersteunen zij begeleiders en behandelaren in hun werk.',
      'De raad van toezicht bewaakt daarbij de koers: zij houdt onafhankelijk toezicht, adviseert het bestuur en fungeert als kritische sparringpartner. Samen met de inspraak van cliënten en medewerkers vormt dit de basis voor de goede zorg die wij elke dag willen blijven leveren.',
    ),
    email: 'contact@burojazz.nl',
    buttons: [
      extLink('Direct aanmelden', '/aanmelden', 'primary'),
      extLink('Neem contact op', '/contact', 'secondary'),
    ],
  },
  {
    blockType: 'coreValues',
    header: { icon: 'IconHeart', eyebrow: 'Over ons', title: 'Dit zijn onze kernwaarden' },
    values: [
      { label: 'Zorgzaam' },
      { label: 'Eerlijk' },
      { label: 'Presentie' },
      { label: 'Passend & integraal' },
      { label: 'Aansluiten' },
      { label: 'Betrouwbaar' },
      { label: 'Voorbeeldfunctie' },
      { label: 'Vernieuwend' },
    ],
  },
  {
    blockType: 'visionMission',
    header: {
      icon: 'IconRocket',
      eyebrow: 'Visie en missie',
      title: 'Waar wij in geloven, en hoe wij daar naar toe werken',
    },
    items: [
      {
        icon: 'IconStar',
        heading: 'Onze visie',
        body: richBody(
          'Buro J.A.Z.Z. gelooft in een inclusieve samenleving waarin iedereen op een gezonde manier kan deelnemen. Iedereen staat in verbinding met zichzelf en de ander, vrij van belemmerende ervaringen of beperkingen.',
        ),
      },
      {
        icon: 'IconHeartHandshake',
        heading: 'Onze missie',
        body: richBody(
          'Wij bieden jeugdhulp die aansluit bij de leefwereld van jeugdigen en hun gezin: dichtbij, betrouwbaar en met oprechte aandacht, zodat zij weer grip krijgen op hun eigen toekomst.',
        ),
      },
      {
        icon: 'IconTargetArrow',
        heading: 'Onze kernwaarden',
        body: richBody(
          'Zorgzaamheid, eerlijkheid en presentie vormen de basis van ons handelen. We sluiten aan bij wat nodig is, werken passend en integraal, en willen daarin betrouwbaar, vernieuwend en een voorbeeld zijn.',
        ),
      },
    ],
  },
  {
    blockType: 'contactPersons',
    header: {
      icon: 'IconUsers',
      eyebrow: 'Kom in contact',
      title: 'Jouw contactpersonen',
      subtitle: 'Wij staan altijd voor u klaar.',
    },
    people: [
      { name: 'Egbert de Boer', role: 'Bestuurder' },
      { name: 'Andres van Eeten', role: 'Bestuurder' },
    ],
  },
  {
    blockType: 'complaints',
    header: {
      eyebrow: 'Stap voor stap',
      title: 'Klachtenregeling',
      intro:
        'Hieronder de klachtenprocedure Wkkgz in het kort. Op de achterzijde vindt u meer toelichting.',
    },
    steps: [
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
    ],
    contact: {
      title: 'Nog vragen?',
      subtitle: 'Wij staan graag voor u klaar.',
      phone: '+31 6 12 34 56 78',
      email: 'info@burojazz.local',
    },
  },
  {
    blockType: 'social',
    header: {
      icon: 'IconBrandInstagram',
      eyebrow: 'Social Media',
      title: 'Samen in verbinding, ook online',
      subtitle: 'We delen inzichten, verhalen en inspiratie uit onze dagelijkse praktijk.',
    },
    handle: '@buro.jazz',
    link: {
      ...extLink('Volg ons op Instagram', 'https://instagram.com/buro.jazz', 'primary'),
      newTab: true,
    },
  },
  {
    blockType: 'vacancies',
    header: {
      icon: 'IconBriefcase',
      title: 'Word onderdeel van ons team',
      intro: 'Samen aan de missie en visie van Buro J.A.Z.Z werken',
    },
    cards: [
      {
        title: 'Ambulant Jeugdhulpverlener',
        location: 'Montfoort',
        hours: 'Voltijd of deeltijd',
        text: 'Begeleid jeugdigen en gezinnen in hun eigen omgeving en bouw mee aan zorg met zorgzaamheid.',
        link: extLink('Bekijk vacature', '#', 'secondary'),
      },
      {
        title: 'Gedragswetenschapper',
        location: 'Montfoort',
        hours: 'Voltijd of deeltijd',
        text: 'Versterk ons team met diagnostiek en behandelinhoudelijke expertise voor onze jeugdigen.',
        link: extLink('Bekijk vacature', '#', 'secondary'),
      },
      {
        title: 'Pedagogisch Medewerker Verblijf',
        location: 'Montfoort',
        hours: 'Voltijd of deeltijd',
        text: 'Bied een veilige en huiselijke omgeving aan jongeren die tijdelijk niet thuis kunnen wonen.',
        link: extLink('Bekijk vacature', '#', 'secondary'),
      },
    ],
  },
]


// Small starter pages for every nav route, so the menu links to real pages.
// Editors replace the placeholder copy (or add layout blocks) in the CMS.
const SMALL_PAGES: { slug: string; title: string }[] = [
  { slug: 'hulpverleningsvormen', title: 'Hulpverleningsvormen' },
  { slug: 'over-ons', title: 'Over ons' },
  { slug: 'klachtregeling', title: 'Klachtregeling' },
  { slug: 'vacatures', title: 'Vacatures' },
  { slug: 'contact', title: 'Contact' },
]

// Every menu item references a real Pages document, so links follow a page
// when its slug changes.
const headerData = (ids: Map<string, Page['id']>) => ({
  navItems: [
    { label: 'Home', type: 'internal' as const, page: ids.get('home') },
    {
      label: 'Hulpverleningsvormen',
      type: 'internal' as const,
      page: ids.get('hulpverleningsvormen'),
    },
    { label: 'Over ons', type: 'internal' as const, page: ids.get('over-ons') },
    { label: 'Klachtregeling', type: 'internal' as const, page: ids.get('klachtregeling') },
    { label: 'Vacatures', type: 'internal' as const, page: ids.get('vacatures') },
  ],
  cta: { label: 'Contact', type: 'internal' as const, page: ids.get('contact') },
})

const footerData = {
  tagline: 'J.A.Z.Z. – Jeugdhulp en Ambulante Zorg met Zorgzaamheid.',
  email: 'contact@burojazz.nl',
  phone: '+31 6 55202233',
  address: 'Vlasakker 24, 3417 XT Montfoort',
  menuItems: [
    { label: 'Home', url: '/' },
    { label: 'Hulpverleningsvormen', url: '/hulpverleningsvormen' },
    { label: 'Over ons', url: '/over-ons' },
    { label: 'Klachtregeling', url: '/klachtregeling' },
    { label: 'Vacatures', url: '/vacatures' },
    { label: 'Contact', url: '/contact' },
  ],
  infoLinks: [
    { label: 'KvK: 85863025', url: '' },
    { label: 'AGB: 90091069', url: '' },
    { label: 'Algemene voorwaarden', url: '/algemene-voorwaarden' },
    { label: 'Privacyverklaring', url: '/privacyverklaring' },
    { label: 'Cookies', url: '/cookies' },
    { label: 'Certificaat', url: '/certificaat' },
  ],
  copyright: 'Copyright © Buro J.A.Z.Z. 2026 –– Alle rechten voorbehouden.',
}

async function run() {
  const payload = await getPayload({ config })

  // --- a. Ensure an admin user exists (the workflow hook checks roles) ---
  const users = await payload.find({ collection: 'users', limit: 1, sort: 'createdAt' })
  let user = users.docs[0] as User | undefined
  if (!user) {
    user = (await payload.create({
      collection: 'users',
      data: {
        email: 'dev@burojazz.local',
        password: 'burojazz-dev',
        roles: ['admin'],
      },
    })) as User
    console.log('No users found — created dev admin dev@burojazz.local / burojazz-dev')
  }
  if (!user.roles?.includes('admin')) {
    user = (await payload.update({
      collection: 'users',
      id: user.id,
      data: { roles: [...(user.roles ?? []), 'admin'] },
    })) as User
    console.log(`Granted admin role to ${user.email}`)
  }
  console.log(`Seeding as ${user.email} (roles: ${user.roles?.join(', ')})`)

  // --- a2. Upload core-value icons to Media and attach them to the block ---
  const coreValuesBlock = layout.find((b) => b.blockType === 'coreValues')
  if (coreValuesBlock && coreValuesBlock.blockType === 'coreValues') {
    coreValuesBlock.values = await Promise.all(
      CORE_VALUE_ICONS.map(async ({ label, file, description }) => ({
        label,
        description: description ?? null,
        image: await upsertMedia(payload, user, `images/core-values/${file}`, `Kernwaarde icoon: ${label}`),
      })),
    )
  }

  // --- a3. Upload contact-person portraits and attach them to the block ---
  const contactBlock = layout.find((b) => b.blockType === 'contactPersons')
  if (contactBlock && contactBlock.blockType === 'contactPersons') {
    contactBlock.people = await Promise.all(
      CONTACT_PEOPLE.map(async ({ name, role, file, phone, email }) => ({
        name,
        role,
        phone,
        email,
        photo: await upsertMedia(payload, user, `images/contact-persons/${file}`, `${name} - ${role}`),
      })),
    )
  }

  // --- a4. Upload the hero image and attach it to the block ---
  const heroBlock = layout.find((b) => b.blockType === 'hero')
  if (heroBlock && heroBlock.blockType === 'hero') {
    heroBlock.image = await upsertMedia(
      payload,
      user,
      'images/header-hero/photo-2.jpg',
      'Begeleider en jongere tijdens een bokstraining',
    )
  }

  // --- a5. Upload the complaints contact portrait and attach it to the block ---
  const complaintsBlk = layout.find((b) => b.blockType === 'complaints')
  if (complaintsBlk && complaintsBlk.blockType === 'complaints' && complaintsBlk.contact) {
    complaintsBlk.contact.photo = await upsertMedia(
      payload,
      user,
      'images/contact-persons/egbert-de-boer-avatar.png',
      'Egbert de Boer - Bestuurder',
    )
  }

  // --- a6. Upload the remaining block images (photos + logos) ---
  const aboutBlock = layout.find((b) => b.blockType === 'about')
  if (aboutBlock && aboutBlock.blockType === 'about') {
    aboutBlock.image = await upsertMedia(
      payload,
      user,
      'images/about/directors.jpg',
      'Directie van Buro J.A.Z.Z.',
    )
  }
  const visionBlock = layout.find((b) => b.blockType === 'visionMission')
  if (visionBlock && visionBlock.blockType === 'visionMission') {
    visionBlock.image = await upsertMedia(
      payload,
      user,
      'images/vision-mission/photo.png',
      'Kind doet een handstand in de gymzaal',
    )
  }
  if (coreValuesBlock && coreValuesBlock.blockType === 'coreValues') {
    coreValuesBlock.logo = await upsertMedia(
      payload,
      user,
      'images/core-values/logo.svg',
      'J.A.Z.Z. logo (kernwaarden)',
    )
  }
  const socialBlock = layout.find((b) => b.blockType === 'social')
  if (socialBlock && socialBlock.blockType === 'social') {
    socialBlock.photos = {
      toys: await upsertMedia(payload, user, 'images/social/photo-toys.jpg', 'Sfeerfoto speelgoed'),
      gym: await upsertMedia(payload, user, 'images/social/photo-gym.jpg', 'Sfeerfoto gymzaal'),
      boxing: await upsertMedia(payload, user, 'images/social/photo-boxing.png', 'Sfeerfoto boksen'),
      figures: await upsertMedia(payload, user, 'images/social/photo-figures.jpg', 'Sfeerfoto figuren'),
      phone: await upsertMedia(payload, user, 'images/social/phone-hand.png', 'Telefoon met Instagram-feed'),
      arrow: await upsertMedia(payload, user, 'images/social/arrow-doodle.svg', 'Pijl-doodle'),
      instagram: await upsertMedia(payload, user, 'images/social/instagram.svg', 'Instagram-icoon'),
    }
  }

  // --- a7. Upload the global logos + certificate ---
  const headerLogoId = await upsertMedia(
    payload,
    user,
    'images/header-hero/logo.svg',
    'Buro J.A.Z.Z. logo (header)',
  )
  const footerLogoId = await upsertMedia(
    payload,
    user,
    'images/footer/logo.svg',
    'Buro J.A.Z.Z. logo (footer)',
  )
  const footerCertId = await upsertMedia(
    payload,
    user,
    'images/footer/kiwa-iso9001.png',
    'Kiwa ISO 9001 certificaat',
  )

  // --- b. Upsert the 'home' page ---
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    draft: true,
    limit: 1,
    depth: 0,
  })
  let home = existing.docs[0] as Page | undefined
  if (!home) {
    home = (await payload.create({
      collection: 'pages',
      draft: true,
      data: { title: 'Home', slug: 'home', workflowStatus: 'draft', layout },
      user,
    })) as Page
    console.log(`Created home page (id ${home.id})`)
  } else {
    console.log(`Found home page (id ${home.id})`)
  }

  // --- c/d. Set layout, move to Ready, then publish (as admin user) ---
  await payload.update({
    collection: 'pages',
    id: home.id,
    draft: true,
    data: { title: 'Home', layout, workflowStatus: 'ready' },
    user,
  })
  console.log('Home draft updated with all 9 blocks; workflowStatus → ready')

  try {
    await payload.update({
      collection: 'pages',
      id: home.id,
      data: { _status: 'published' },
      user,
    })
    console.log('Home page published')
  } catch (err) {
    console.error('PUBLISH FAILED:', err instanceof Error ? err.message : err)
    throw err
  }

  // --- e. Upsert + publish a small page for every nav route ---
  const pageIdBySlug = new Map<string, Page['id']>([['home', home.id]])
  for (const def of SMALL_PAGES) {
    const found = await payload.find({
      collection: 'pages',
      where: { slug: { equals: def.slug } },
      draft: true,
      limit: 1,
      depth: 0,
    })
    let doc = found.docs[0] as Page | undefined
    if (!doc) {
      doc = (await payload.create({
        collection: 'pages',
        draft: true,
        data: {
          title: def.title,
          slug: def.slug,
          workflowStatus: 'draft',
        },
        user,
      })) as Page
      console.log(`Created ${def.slug} page (id ${doc.id})`)
    }
    await payload.update({
      collection: 'pages',
      id: doc.id,
      draft: true,
      data: { title: def.title, workflowStatus: 'ready' },
      user,
    })
    await payload.update({
      collection: 'pages',
      id: doc.id,
      data: { _status: 'published' },
      user,
    })
    pageIdBySlug.set(def.slug, doc.id)
    console.log(`Published /${def.slug}`)
  }

  // --- f. Seed the header & footer globals ---
  await payload.updateGlobal({
    slug: 'header',
    data: { ...headerData(pageIdBySlug), logo: headerLogoId },
    user,
  })
  console.log('Header global seeded')
  await payload.updateGlobal({
    slug: 'footer',
    data: { ...footerData, logo: footerLogoId, certImage: footerCertId },
    user,
  })
  console.log('Footer global seeded')

  console.log('Seed complete.')
}

// Top-level await so `payload run` waits for the async work to finish.
try {
  await run()
  process.exit(0)
} catch (err) {
  console.error(err)
  process.exit(1)
}
