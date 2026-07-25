/**
 * src/lib/metadata.ts — per-page SEO metadata.
 *
 * The subtle rules are about the document title: the layout applies a
 * `%s — Buro J.A.Z.Z.` template, so this helper must avoid producing a doubled
 * suffix, and must stand aside entirely on the homepage when the editor has set
 * no title of their own.
 */
import { describe, expect, it } from 'vitest'

import { buildPageMetadata } from '../../src/lib/metadata'
import { SITE_NAME } from '../../src/lib/siteUrl'

type Meta = Parameters<typeof buildPageMetadata>[0]['meta']

const page = (title: string, meta?: Meta) => ({ title, meta }) as Parameters<
  typeof buildPageMetadata
>[0]

describe('canonical URL', () => {
  it('is absolute, on the canonical origin', () => {
    const meta = buildPageMetadata(page('Contact'), { path: '/contact' })

    expect(meta.alternates?.canonical).toMatch(/^https?:\/\/[^/]+\/contact$/)
  })

  it('matches the og:url', () => {
    const meta = buildPageMetadata(page('Contact'), { path: '/contact' })

    expect(meta.openGraph?.url).toBe(meta.alternates?.canonical)
  })
})

describe('document title', () => {
  it('uses the bare page title on a sub page, letting the layout add the suffix', () => {
    expect(buildPageMetadata(page('Vacatures'), { path: '/vacatures' }).title).toBe('Vacatures')
  })

  it('marks an editor-set title absolute, so the suffix is not added twice', () => {
    const meta = buildPageMetadata(page('Vacatures', { title: 'Werken bij ons — Buro J.A.Z.Z.' }), {
      path: '/vacatures',
    })

    expect(meta.title).toEqual({ absolute: 'Werken bij ons — Buro J.A.Z.Z.' })
  })

  it('omits the title on the homepage, deferring to the layout default', () => {
    expect(buildPageMetadata(page('Home'), { path: '/', homepage: true }).title).toBeUndefined()
  })

  it('still honours an editor title on the homepage', () => {
    const meta = buildPageMetadata(page('Home', { title: 'Buro J.A.Z.Z.' }), {
      path: '/',
      homepage: true,
    })

    expect(meta.title).toEqual({ absolute: 'Buro J.A.Z.Z.' })
  })

  it('ignores a whitespace-only editor title', () => {
    expect(buildPageMetadata(page('Vacatures', { title: '   ' }), { path: '/v' }).title).toBe(
      'Vacatures',
    )
  })
})

describe('description', () => {
  it('uses the editor description when set', () => {
    const meta = buildPageMetadata(page('X', { description: 'Onze vacatures.' }), { path: '/x' })

    expect(meta.description).toBe('Onze vacatures.')
    expect(meta.openGraph?.description).toBe('Onze vacatures.')
    expect(meta.twitter?.description).toBe('Onze vacatures.')
  })

  it.each([
    ['no meta', undefined],
    ['an empty description', { description: '' }],
    ['a whitespace description', { description: '  ' }],
  ])('falls back to the site default for %s', (_label, meta) => {
    expect(buildPageMetadata(page('X', meta as Meta), { path: '/x' }).description).toContain(
      'Buro J.A.Z.Z.',
    )
  })
})

describe('social titles', () => {
  it('brands the og/twitter title on a sub page', () => {
    const meta = buildPageMetadata(page('Vacatures'), { path: '/vacatures' })

    expect(meta.openGraph?.title).toBe(`Vacatures — ${SITE_NAME}`)
    expect(meta.twitter?.title).toBe(`Vacatures — ${SITE_NAME}`)
  })

  it('omits the og title on the homepage with no editor title', () => {
    const meta = buildPageMetadata(page('Home'), { path: '/', homepage: true })

    expect(meta.openGraph?.title).toBeUndefined()
  })

  it('sets no image — the opengraph-image route owns it', () => {
    const meta = buildPageMetadata(page('X'), { path: '/x' })

    expect((meta.openGraph as { images?: unknown }).images).toBeUndefined()
    expect((meta.twitter as { images?: unknown }).images).toBeUndefined()
  })
})

describe('robots', () => {
  it('blocks indexing only when the editor ticks noindex', () => {
    expect(buildPageMetadata(page('X', { noindex: true }), { path: '/x' }).robots).toEqual({
      index: false,
      follow: false,
    })
  })

  it.each([
    ['noindex is false', { noindex: false }],
    ['there is no meta group', undefined],
  ])('leaves robots to the layout when %s', (_label, meta) => {
    expect(buildPageMetadata(page('X', meta as Meta), { path: '/x' }).robots).toBeUndefined()
  })
})
