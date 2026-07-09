/**
 * Seed the Home page (all 9 layout blocks), publish it through the editorial
 * workflow, and seed the Header/Footer globals.
 *
 * Run with:  pnpm payload run scripts/seed-home.ts
 *
 * Idempotent: re-running updates the existing page/globals and re-publishes.
 */
import { getPayload } from 'payload'

import config from '../src/payload.config'
import type { Page, User } from '../src/payload-types'

type Layout = NonNullable<Page['layout']>

const layout: Layout = [
  {
    blockType: 'hero',
    title: 'BURO J.A.Z.Z.',
    subtitle: 'Jeugdhulp en Ambulante Zorg met Zorgzaamheid',
    description:
      'Wij bieden ambulante jeugdhulp en jeugdhulp met verblijf, gericht op behandeling en begeleiding.',
    primaryCta: { label: 'Direct aanmelden', url: '/aanmelden' },
    secondaryCta: { label: 'Neem contact op', url: '/contact' },
    cert: {
      title: 'Gecertificeerde kwaliteit',
      text: 'Buro J.A.Z.Z. is Kiwa gecertificeerd voor betrouwbare en veilige zorg.',
      linkLabel: 'Meer informatie',
      linkUrl: '/certificaat',
    },
  },
  {
    blockType: 'services',
    eyebrow: 'Hulpverleningsvormen',
    title: 'Ambulante jeugdhulp en verblijf, gericht op behandeling en begeleiding.',
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
        linkLabel: 'Lees verder',
        linkUrl: '#',
      },
      {
        number: '02',
        title: 'Trauma behandeling',
        description:
          'Hulp bij het verwerken van ingrijpende ervaringen in een veilige setting.',
        linkLabel: 'Lees verder',
        linkUrl: '#',
      },
      {
        number: '03',
        title: 'Systeemtherapie',
        description: 'Behandeling die relaties en gezinsdynamiek centraal stelt.',
        linkLabel: 'Lees verder',
        linkUrl: '#',
      },
      {
        number: '04',
        title: 'Psychomotore Therapie (PMT)',
        description:
          'Therapie gericht op lichaam, gedrag en emotie via beweging en ervaring.',
        linkLabel: 'Lees verder',
        linkUrl: '#',
      },
      {
        number: '05',
        title: 'Theraplay',
        description: 'Speelse therapie om de band tussen ouder en kind te verbeteren.',
        linkLabel: 'Lees verder',
        linkUrl: '#',
      },
    ],
  },
  {
    blockType: 'about',
    eyebrow: 'Wie wij zijn',
    title: 'Ook Buro J.A.Z.Z heeft goede zorg nodig',
    body:
      'Andres en Egbert zijn de bestuurders van Stichting Buro J.A.Z.Z. Vanuit de kern van waar Buro J.A.Z.Z. voor staat – Jeugdhulp en Ambulante Zorg met Zorgzaamheid – zetten zij zich dagelijks in voor kwalitatieve en verantwoorde zorg. Met hun jarenlange ervaring als jeugdhulpverleners staan zij dicht bij de praktijk en ondersteunen zij begeleiders en behandelaren in hun werk.',
    email: 'contact@burojazz.nl',
    // NOTE: About.tsx hardcodes the CTA href to /aanmelden, so this label
    // must describe that destination (the block has no ctaUrl field yet).
    ctaLabel: 'Direct aanmelden',
  },
  {
    blockType: 'coreValues',
    title: 'Dit zijn onze kernwaarden',
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
    title: 'Waar wij in geloven, en hoe wij daar naar toe werken',
    items: [
      {
        heading: 'Onze visie',
        body:
          'Wij geloven in een inclusieve samenleving waarin ieder kind en iedere jongere veilig kan opgroeien en volwaardig kan meedoen, ongeacht achtergrond of beperking.',
      },
      {
        heading: 'Onze missie',
        body:
          'Wij bieden jeugdhulp die aansluit bij de leefwereld van jeugdigen en hun gezin: dichtbij, betrouwbaar en met oprechte aandacht, zodat zij weer grip krijgen op hun eigen toekomst.',
      },
      {
        heading: 'Onze kernwaarden',
        body:
          'Zorgzaamheid, eerlijkheid en presentie vormen de basis van ons handelen. We sluiten aan bij wat nodig is, werken passend en integraal, en willen daarin betrouwbaar, vernieuwend en een voorbeeld zijn.',
      },
    ],
  },
  {
    blockType: 'contactPersons',
    eyebrow: 'Kom in contact',
    title: 'Jouw contactpersonen',
    subtitle: 'Wij staan altijd voor u klaar.',
    people: [
      { name: 'Egbert de Boer', role: 'Bestuurder' },
      { name: 'Andres van Eeten', role: 'Bestuurder' },
    ],
  },
  {
    blockType: 'complaints',
    eyebrow: 'Stap voor stap',
    title: 'Klachtenregeling',
    intro:
      'Hieronder de klachtenprocedure Wkkgz in het kort... Op de achterzijde vindt u meer toelichting.',
    steps: [
      {
        title: 'Maak uw klacht bespreekbaar',
        text:
          'Praat met uw zorgverlener over uw klacht, misschien kunt u het samen oplossen.',
      },
      {
        title: 'Klacht indienen',
        text:
          'Stuur Klachtenportaal Zorg (KPZ) uw klacht. KPZ leest uw klacht en, als uw zorgaanbieder aangesloten is bij KPZ, neemt een klachtenfunctionaris contact met u op.',
      },
      {
        title: 'Klachtbrief maken',
        text:
          'De klachtenfunctionaris beschrift uw klacht in de klachtbrief, deze wordt, na uw akkoord, aan de zorgaanbieder gestuurd. De zorgaanbieder reageert naar de klachtenfunctionaris. Deze bespreekt de reactie met u.',
      },
      {
        title: 'Reactie zorgaanbieder',
        text:
          'De zorgaanbieder schrijft alle gemaakte afspraken op in een brief. De klachtenfunctionaris schrift een afsluitende brief.',
      },
    ],
  },
  {
    blockType: 'social',
    title: 'Samen in verbinding, ook online',
    handle: '@buro.jazz',
    subtitle: 'We delen inzichten, verhalen en inspiratie uit onze dagelijkse praktijk.',
    linkLabel: 'Volg ons op Instagram',
    linkUrl: 'https://instagram.com/buro.jazz',
  },
  {
    blockType: 'vacancies',
    title: 'Word onderdeel van ons team',
    intro: 'Samen aan de missie en visie werken van Buro J.A.Z.Z.?',
    cards: [
      {
        title: 'Ambulant Jeugdhulpverlener',
        location: 'Montfoort',
        hours: 'Voltijd of deeltijd',
        text:
          'Begeleid jeugdigen en gezinnen in hun eigen omgeving en bouw mee aan zorg met zorgzaamheid.',
        linkLabel: 'Bekijk vacature',
        linkUrl: '#',
      },
      {
        title: 'Gedragswetenschapper',
        location: 'Montfoort',
        hours: 'Voltijd of deeltijd',
        text:
          'Versterk ons team met diagnostiek en behandelinhoudelijke expertise voor onze jeugdigen.',
        linkLabel: 'Bekijk vacature',
        linkUrl: '#',
      },
      {
        title: 'Pedagogisch Medewerker Verblijf',
        location: 'Montfoort',
        hours: 'Voltijd of deeltijd',
        text:
          'Bied een veilige en huiselijke omgeving aan jongeren die tijdelijk niet thuis kunnen wonen.',
        linkLabel: 'Bekijk vacature',
        linkUrl: '#',
      },
    ],
  },
]

const headerData = {
  navItems: [
    { label: 'Home', url: '/' },
    { label: 'Hulpverleningsvormen', url: '/hulpverleningsvormen' },
    { label: 'Over ons', url: '/over-ons' },
    { label: 'Klachtregeling', url: '/klachtregeling' },
    { label: 'Vacatures', url: '/vacatures' },
  ],
  cta: { label: 'Contact', url: '/contact' },
}

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

  // --- a. Ensure the first user is an admin (the workflow hook checks roles) ---
  const users = await payload.find({ collection: 'users', limit: 1, sort: 'createdAt' })
  let user = users.docs[0] as User | undefined
  if (!user) {
    throw new Error('No users found — create a user via /admin first, then re-run the seed.')
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

  // --- e. Seed the header & footer globals ---
  await payload.updateGlobal({ slug: 'header', data: headerData, user })
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
