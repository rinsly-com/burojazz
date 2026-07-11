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
import { getPayload } from 'payload'

import config from '../src/payload.config'
import type { Page, User } from '../src/payload-types'

type Layout = NonNullable<Page['layout']>

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
    cert: {
      title: 'Gecertificeerde kwaliteit',
      text: 'Buro J.A.Z.Z. is Kiwa gecertificeerd voor betrouwbare en veilige zorg.',
      link: extLink('Meer informatie', '/certificaat', 'secondary'),
    },
  },
  {
    blockType: 'services',
    header: {
      icon: 'IconDiamond',
      eyebrow: 'Hulpverleningsvormen',
      title: 'Ambulante jeugdhulp en verblijf, gericht op behandeling en begeleiding.',
    },
    tabs: [
      { label: 'Behandeling' },
      { label: 'Begeleiding' },
      { label: 'Diagnostiek & Consultatie' },
      { label: 'Crisis & Verblijf' },
    ],
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
    blockType: 'about',
    header: {
      icon: 'IconUsers',
      eyebrow: 'Wie wij zijn',
      title: 'Ook Buro J.A.Z.Z heeft goede zorg nodig',
    },
    body: 'Andres en Egbert zijn de bestuurders van Stichting Buro J.A.Z.Z. Vanuit de kern van waar Buro J.A.Z.Z. voor staat – Jeugdhulp en Ambulante Zorg met Zorgzaamheid – zetten zij zich dagelijks in voor kwalitatieve en verantwoorde zorg. Met hun jarenlange ervaring als jeugdhulpverleners staan zij dicht bij de praktijk en ondersteunen zij begeleiders en behandelaren in hun werk. De raad van toezicht bewaakt daarbij de koers: zij houdt onafhankelijk toezicht, adviseert het bestuur en fungeert als kritische sparringpartner. Samen met de inspraak van cliënten en medewerkers vormt dit de basis voor de goede zorg die wij elke dag willen blijven leveren.',
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
        body: 'Buro J.A.Z.Z. gelooft in een inclusieve samenleving waarin iedereen op een gezonde manier kan deelnemen. Iedereen staat in verbinding met zichzelf en de ander, vrij van belemmerende ervaringen of beperkingen.',
      },
      {
        icon: 'IconHeartHandshake',
        heading: 'Onze missie',
        body: 'Wij bieden jeugdhulp die aansluit bij de leefwereld van jeugdigen en hun gezin: dichtbij, betrouwbaar en met oprechte aandacht, zodat zij weer grip krijgen op hun eigen toekomst.',
      },
      {
        icon: 'IconTargetArrow',
        heading: 'Onze kernwaarden',
        body: 'Zorgzaamheid, eerlijkheid en presentie vormen de basis van ons handelen. We sluiten aan bij wat nodig is, werken passend en integraal, en willen daarin betrouwbaar, vernieuwend en een voorbeeld zijn.',
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
    ],
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

/** Minimal Lexical rich-text state: a single paragraph. */
const smallPageContent = (text: string): NonNullable<Page['content']> => ({
  root: {
    type: 'root',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        type: 'paragraph',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: [
          { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
        ],
      },
    ],
  },
})

// Small starter pages for every nav route, so the menu links to real pages.
// Editors replace the placeholder copy (or add layout blocks) in the CMS.
const SMALL_PAGES: { slug: string; title: string; text: string }[] = [
  {
    slug: 'hulpverleningsvormen',
    title: 'Hulpverleningsvormen',
    text: 'Wij bieden ambulante jeugdhulp en jeugdhulp met verblijf, gericht op behandeling en begeleiding. Meer informatie over onze hulpverleningsvormen volgt binnenkort.',
  },
  {
    slug: 'over-ons',
    title: 'Over ons',
    text: 'Buro J.A.Z.Z. staat voor Jeugdhulp en Ambulante Zorg met Zorgzaamheid. Meer over ons team en onze werkwijze volgt binnenkort.',
  },
  {
    slug: 'klachtregeling',
    title: 'Klachtregeling',
    text: 'Heeft u een klacht over onze zorg of dienstverlening? Neem contact met ons op. De volledige klachtregeling volgt binnenkort.',
  },
  {
    slug: 'vacatures',
    title: 'Vacatures',
    text: 'Wij zijn regelmatig op zoek naar nieuwe collega’s. Onze openstaande vacatures verschijnen binnenkort op deze pagina.',
  },
  {
    slug: 'contact',
    title: 'Contact',
    text: 'Neem contact met ons op via contact@burojazz.nl of +31 6 55202233. Bezoekadres: Vlasakker 24, 3417 XT Montfoort.',
  },
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
          content: smallPageContent(def.text),
        },
        user,
      })) as Page
      console.log(`Created ${def.slug} page (id ${doc.id})`)
    }
    await payload.update({
      collection: 'pages',
      id: doc.id,
      draft: true,
      data: { title: def.title, content: smallPageContent(def.text), workflowStatus: 'ready' },
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
  await payload.updateGlobal({ slug: 'header', data: headerData(pageIdBySlug), user })
  console.log('Header global seeded')
  await payload.updateGlobal({ slug: 'footer', data: footerData, user })
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
