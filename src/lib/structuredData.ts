import type { Footer, Page } from '@/payload-types'
import { absoluteUrl, SITE_NAME, SITE_URL } from './siteUrl'

const DEFAULT_DESCRIPTION = 'Buro J.A.Z.Z. — jeugdzorg, advies, zorg en zekerheid.'

/** Resolve a populated Media relation to an absolute, crawler-reachable URL. */
function absoluteMediaUrl(media: unknown): string | undefined {
  if (!media || typeof media !== 'object') return undefined
  const url = (media as { url?: string | null }).url
  if (!url) return undefined
  const origin = process.env.PAYLOAD_API_URL || 'http://localhost:3000'
  return new URL(url, origin).toString()
}

/** Flatten a Lexical richText value to a single plain-text string. */
function lexicalToText(value: unknown): string {
  const root = (value as { root?: { children?: unknown[] } } | null | undefined)?.root
  if (!root?.children) return ''
  const parts: string[] = []
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const n = node as { text?: unknown; children?: unknown }
    if (typeof n.text === 'string') parts.push(n.text)
    if (Array.isArray(n.children)) n.children.forEach(walk)
  }
  root.children.forEach(walk)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

/**
 * Site-wide Organization/WebSite graph. Becomes a LocalBusiness (a richer,
 * local-pack-eligible type) once a footer address is set, carrying the footer's
 * contact details. Stable across pages so it is safe in the static export.
 */
export function buildSiteJsonLd(footer: Footer | null): Record<string, unknown> {
  const logo = absoluteMediaUrl(footer?.logo) ?? absoluteUrl('/favicon.ico')
  const org: Record<string, unknown> = {
    '@type': footer?.address ? 'LocalBusiness' : 'Organization',
    '@id': absoluteUrl('/#organization'),
    name: SITE_NAME,
    alternateName: 'Buro JAZZ',
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    logo,
    image: logo,
  }
  if (footer?.email) org.email = footer.email
  if (footer?.phone) org.telephone = footer.phone
  if (footer?.address) {
    org.address = {
      '@type': 'PostalAddress',
      streetAddress: footer.address,
      addressCountry: 'NL',
    }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      org,
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: 'nl-NL',
        publisher: { '@id': absoluteUrl('/#organization') },
      },
    ],
  }
}

type LayoutBlock = { blockType?: string; [key: string]: unknown }

/**
 * Per-page structured data derived from the block layout:
 * - `accordion` blocks → one FAQPage (Q/A rich results)
 * - `vacancies` blocks → a JobPosting per card (Google Jobs)
 * Returns an array of top-level JSON-LD objects (empty when nothing applies).
 */
export function buildPageJsonLd(page: Page): Record<string, unknown>[] {
  const layout = (page.layout ?? []) as LayoutBlock[]
  const out: Record<string, unknown>[] = []

  // FAQ — merge every accordion's items into a single FAQPage.
  const faqItems = layout
    .filter((b) => b.blockType === 'accordion')
    .flatMap((b) => (Array.isArray(b.items) ? (b.items as LayoutBlock[]) : []))
    .map((item) => {
      const name = typeof item.title === 'string' ? item.title.trim() : ''
      const text = lexicalToText(item.body)
      return name && text ? { name, text } : null
    })
    .filter((x): x is { name: string; text: string } => x !== null)

  if (faqItems.length) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((q) => ({
        '@type': 'Question',
        name: q.name,
        acceptedAnswer: { '@type': 'Answer', text: q.text },
      })),
    })
  }

  // Vacancies — one JobPosting per card. datePosted is required by Google, so
  // fall back to the page's timestamps.
  const datePosted = page.updatedAt || page.createdAt
  const cards = layout
    .filter((b) => b.blockType === 'vacancies')
    .flatMap((b) => (Array.isArray(b.cards) ? (b.cards as LayoutBlock[]) : []))

  for (const card of cards) {
    const title = typeof card.title === 'string' ? card.title.trim() : ''
    if (!title) continue
    const description = (typeof card.text === 'string' && card.text.trim()) || title
    const location = typeof card.location === 'string' ? card.location.trim() : ''

    const job: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title,
      description,
      hiringOrganization: { '@type': 'Organization', name: SITE_NAME, sameAs: SITE_URL },
      ...(datePosted ? { datePosted } : {}),
    }
    if (location) {
      job.jobLocation = {
        '@type': 'Place',
        address: { '@type': 'PostalAddress', addressLocality: location, addressCountry: 'NL' },
      }
    } else {
      // No physical location given → mark as remote so Google still accepts it.
      job.jobLocationType = 'TELECOMMUTE'
      job.applicantLocationRequirements = { '@type': 'Country', name: 'Netherlands' }
    }
    out.push(job)
  }

  return out
}
