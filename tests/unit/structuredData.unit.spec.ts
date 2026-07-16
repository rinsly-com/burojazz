// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Footer, Page } from '@/payload-types'
import { buildPageJsonLd, buildSiteJsonLd } from '@/lib/structuredData'

const footer = (over: Partial<Footer> = {}) => over as unknown as Footer
const page = (over: Partial<Page> = {}) => ({ layout: [], ...over }) as unknown as Page

/** A minimal Lexical richText value wrapping a single paragraph of text. */
function lexical(text: string) {
  return {
    root: { children: [{ type: 'paragraph', children: [{ type: 'text', text }] }] },
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('buildSiteJsonLd', () => {
  it('emits an Organization graph when no address is set', () => {
    const jsonLd = buildSiteJsonLd(footer({}))
    const graph = jsonLd['@graph'] as Record<string, unknown>[]
    expect(jsonLd['@context']).toBe('https://schema.org')
    expect(graph[0]['@type']).toBe('Organization')
    expect(graph[0].name).toBe('Buro J.A.Z.Z.')
    expect(graph[1]['@type']).toBe('WebSite')
    expect((graph[1].publisher as Record<string, unknown>)['@id']).toBe(graph[0]['@id'])
  })

  it('upgrades to LocalBusiness with a PostalAddress once an address is set', () => {
    const graph = buildSiteJsonLd(footer({ address: 'Dorpsstraat 1, Utrecht' }))['@graph'] as Record<
      string,
      unknown
    >[]
    expect(graph[0]['@type']).toBe('LocalBusiness')
    expect(graph[0].address).toMatchObject({
      '@type': 'PostalAddress',
      streetAddress: 'Dorpsstraat 1, Utrecht',
      addressCountry: 'NL',
    })
  })

  it('includes email and telephone when present', () => {
    const graph = buildSiteJsonLd(footer({ email: 'info@burojazz.nl', phone: '030-1234567' }))[
      '@graph'
    ] as Record<string, unknown>[]
    expect(graph[0].email).toBe('info@burojazz.nl')
    expect(graph[0].telephone).toBe('030-1234567')
  })

  it('omits email / telephone / address when absent', () => {
    const org = (buildSiteJsonLd(footer({}))['@graph'] as Record<string, unknown>[])[0]
    expect(org.email).toBeUndefined()
    expect(org.telephone).toBeUndefined()
    expect(org.address).toBeUndefined()
  })

  it('falls back to the favicon when no logo relation is populated', () => {
    const org = (buildSiteJsonLd(footer({}))['@graph'] as Record<string, unknown>[])[0]
    expect(org.logo).toBe('https://burojazz.com/favicon.ico')
    expect(org.image).toBe(org.logo)
  })

  it('resolves a populated logo relation to an absolute URL', () => {
    vi.stubEnv('PAYLOAD_API_URL', 'https://accp.example.com')
    const org = (
      buildSiteJsonLd(footer({ logo: { url: '/api/media/file/logo.png' } as Footer['logo'] }))[
        '@graph'
      ] as Record<string, unknown>[]
    )[0]
    expect(org.logo).toBe('https://accp.example.com/api/media/file/logo.png')
  })

  it('tolerates a null footer', () => {
    expect(() => buildSiteJsonLd(null)).not.toThrow()
    const org = (buildSiteJsonLd(null)['@graph'] as Record<string, unknown>[])[0]
    expect(org['@type']).toBe('Organization')
  })
})

describe('buildPageJsonLd — FAQ from accordion blocks', () => {
  it('merges accordion items into a single FAQPage', () => {
    const out = buildPageJsonLd(
      page({
        layout: [
          {
            blockType: 'accordion',
            items: [
              { title: 'Wat kost het?', body: lexical('Dat hangt af van de zorg.') },
              { title: 'Hoe meld ik aan?', body: lexical('Via het formulier.') },
            ],
          },
        ] as unknown as Page['layout'],
      }),
    )
    expect(out).toHaveLength(1)
    expect(out[0]['@type']).toBe('FAQPage')
    const entities = out[0].mainEntity as Record<string, unknown>[]
    expect(entities).toHaveLength(2)
    expect(entities[0].name).toBe('Wat kost het?')
    expect((entities[0].acceptedAnswer as Record<string, unknown>).text).toBe(
      'Dat hangt af van de zorg.',
    )
  })

  it('skips accordion items missing a title or body text', () => {
    const out = buildPageJsonLd(
      page({
        layout: [
          {
            blockType: 'accordion',
            items: [
              { title: '', body: lexical('Antwoord zonder vraag') },
              { title: 'Vraag zonder antwoord', body: lexical('   ') },
              { title: 'Geldige vraag', body: lexical('Geldig antwoord') },
            ],
          },
        ] as unknown as Page['layout'],
      }),
    )
    const entities = out[0].mainEntity as Record<string, unknown>[]
    expect(entities).toHaveLength(1)
    expect(entities[0].name).toBe('Geldige vraag')
  })

  it('collapses nested lexical text nodes and whitespace', () => {
    const nested = {
      root: {
        children: [
          { type: 'paragraph', children: [{ type: 'text', text: 'Regel  een' }] },
          { type: 'paragraph', children: [{ type: 'text', text: 'regel twee' }] },
        ],
      },
    }
    const out = buildPageJsonLd(
      page({
        layout: [
          { blockType: 'accordion', items: [{ title: 'Q', body: nested }] },
        ] as unknown as Page['layout'],
      }),
    )
    const text = (
      (out[0].mainEntity as Record<string, unknown>[])[0].acceptedAnswer as Record<string, unknown>
    ).text
    expect(text).toBe('Regel een regel twee')
  })
})

describe('buildPageJsonLd — JobPosting from vacancies blocks', () => {
  it('emits a JobPosting per card with a physical location', () => {
    const out = buildPageJsonLd(
      page({
        updatedAt: '2026-01-15T10:00:00.000Z',
        layout: [
          {
            blockType: 'vacancies',
            cards: [{ title: 'PMT-therapeut', text: 'Kom ons team versterken.', location: 'Utrecht' }],
          },
        ] as unknown as Page['layout'],
      }),
    )
    expect(out).toHaveLength(1)
    expect(out[0]['@type']).toBe('JobPosting')
    expect(out[0].title).toBe('PMT-therapeut')
    expect(out[0].datePosted).toBe('2026-01-15T10:00:00.000Z')
    expect((out[0].jobLocation as Record<string, unknown>).address).toMatchObject({
      addressLocality: 'Utrecht',
    })
  })

  it('marks a location-less job as remote (TELECOMMUTE)', () => {
    const out = buildPageJsonLd(
      page({
        layout: [
          { blockType: 'vacancies', cards: [{ title: 'Remote job' }] },
        ] as unknown as Page['layout'],
      }),
    )
    expect(out[0].jobLocationType).toBe('TELECOMMUTE')
    expect(out[0].jobLocation).toBeUndefined()
    expect(out[0].applicantLocationRequirements).toMatchObject({ name: 'Netherlands' })
  })

  it('falls back to the title as description and skips titleless cards', () => {
    const out = buildPageJsonLd(
      page({
        createdAt: '2026-02-01T00:00:00.000Z',
        layout: [
          {
            blockType: 'vacancies',
            cards: [{ title: 'Alleen titel' }, { title: '' }],
          },
        ] as unknown as Page['layout'],
      }),
    )
    expect(out).toHaveLength(1)
    expect(out[0].description).toBe('Alleen titel')
    expect(out[0].datePosted).toBe('2026-02-01T00:00:00.000Z')
  })
})

describe('buildPageJsonLd — edge cases', () => {
  it('returns an empty array for a page with no relevant blocks', () => {
    expect(buildPageJsonLd(page({ layout: [{ blockType: 'hero' }] as unknown as Page['layout'] }))).toEqual([])
  })

  it('returns an empty array when layout is missing entirely', () => {
    expect(buildPageJsonLd(page({ layout: null }))).toEqual([])
  })

  it('combines FAQ and JobPosting output from a mixed layout', () => {
    const out = buildPageJsonLd(
      page({
        layout: [
          { blockType: 'accordion', items: [{ title: 'Q', body: lexical('A') }] },
          { blockType: 'vacancies', cards: [{ title: 'Job', location: 'Utrecht' }] },
        ] as unknown as Page['layout'],
      }),
    )
    expect(out.map((o) => o['@type'])).toEqual(['FAQPage', 'JobPosting'])
  })
})
