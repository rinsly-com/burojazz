/**
 * src/lib/pages.ts — the two helpers that decide what preview shows and what
 * production ships. Both have caused live incidents, so the failure modes are
 * pinned here:
 *
 * 1. Preview hid published pages. `draft=true` reads Payload's versions table
 *    and omits any page with no version rows (e.g. one seeded before drafts
 *    existed), so accp 404'd a page that was live on production.
 * 2. The production build must ship published content only — never a draft, and
 *    never a page's in-progress edits.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Page } from '@/payload-types'

const { apiOrigin, readSnapshot } = vi.hoisted(() => ({
  apiOrigin: vi.fn(),
  readSnapshot: vi.fn(),
}))

vi.mock('../../src/lib/apiOrigin', () => ({ apiOrigin }))
vi.mock('../../src/lib/contentSnapshot', () => ({ readSnapshot }))

const ORIGIN = 'https://accp.test'

const page = (slug: string, extra: Partial<Page> = {}): Page =>
  ({ id: slug.length, slug, title: slug, ...extra }) as Page

/**
 * `wrangler types` declares these vars as required string literals, so tests
 * cannot assign or delete them through the typed `process.env`.
 */
const env = process.env as unknown as Record<string, string | undefined>

/** Requests the helper made, in order, as the query string after `/api/pages?`. */
let queries: string[]

/** Queue one response per fetch call, in order. */
const respondWith = (...bodies: ({ docs: Page[] } | 'error')[]) => {
  let call = 0
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      queries.push(String(url).split('/api/pages?')[1] ?? String(url))
      const body = bodies[call++]
      if (body === 'error') return { ok: false, status: 500 } as unknown as Response
      return { ok: true, json: async () => body } as unknown as Response
    }),
  )
}

/**
 * `PRODUCTION_BUILD` is read once at module load, so each mode needs a fresh
 * import rather than a mutated env.
 */
async function loadPages(mode: 'build' | 'preview') {
  vi.resetModules()
  if (mode === 'build') env.BUILD_STATIC = 'true'
  else delete env.BUILD_STATIC
  return import('../../src/lib/pages')
}

beforeEach(() => {
  queries = []
  apiOrigin.mockResolvedValue(ORIGIN)
  readSnapshot.mockResolvedValue(null)
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete env.BUILD_STATIC
})

describe('getRenderablePages — preview (accp / dev)', () => {
  it('includes a published page that has no draft version rows', async () => {
    // REGRESSION: `contact` was published and live on production, but had no
    // version rows, so the draft query dropped it and accp 404'd the page.
    respondWith({ docs: [page('home')] }, { docs: [page('home'), page('contact')] })

    const { getRenderablePages } = await loadPages('preview')
    const slugs = (await getRenderablePages()).map((p) => p.slug).sort()

    expect(slugs).toEqual(['contact', 'home'])
  })

  it('prefers the draft version over the live row for the same slug', async () => {
    const draft = page('home', { title: 'Edited in review' })
    const live = page('home', { title: 'Live copy' })
    respondWith({ docs: [draft] }, { docs: [live] })

    const { getRenderablePages } = await loadPages('preview')
    const [only] = await getRenderablePages()

    expect(only.title).toBe('Edited in review')
  })

  it('asks for drafts and live rows, never filtering on published', async () => {
    respondWith({ docs: [] }, { docs: [] })

    const { getRenderablePages } = await loadPages('preview')
    await getRenderablePages()

    expect(queries).toHaveLength(2)
    expect(queries.some((q) => q.includes('draft=true'))).toBe(true)
    expect(queries.join(' ')).not.toContain('_status')
  })

  it('still returns the live rows when the draft query fails', async () => {
    respondWith('error', { docs: [page('contact')] })

    const { getRenderablePages } = await loadPages('preview')

    expect((await getRenderablePages()).map((p) => p.slug)).toEqual(['contact'])
  })
})

describe('getRenderablePageBySlug — preview (accp / dev)', () => {
  it('falls back to the live row when the page has no draft version', async () => {
    // REGRESSION: this is the accp.burojazz.com/contact 404.
    respondWith({ docs: [] }, { docs: [page('contact')] })

    const { getRenderablePageBySlug } = await loadPages('preview')

    expect((await getRenderablePageBySlug('contact'))?.slug).toBe('contact')
  })

  it('returns the draft version without a second request when one exists', async () => {
    respondWith({ docs: [page('home', { title: 'Draft copy' })] })

    const { getRenderablePageBySlug } = await loadPages('preview')
    const found = await getRenderablePageBySlug('home')

    expect(found?.title).toBe('Draft copy')
    expect(queries).toHaveLength(1)
  })

  it('returns null when neither query finds the page', async () => {
    respondWith({ docs: [] }, { docs: [] })

    const { getRenderablePageBySlug } = await loadPages('preview')

    expect(await getRenderablePageBySlug('nope')).toBeNull()
  })

  it('encodes the slug into the query', async () => {
    respondWith({ docs: [page('a b/c')] })

    const { getRenderablePageBySlug } = await loadPages('preview')
    await getRenderablePageBySlug('a b/c')

    expect(queries[0]).toContain(encodeURIComponent('a b/c'))
  })
})

describe('production static build', () => {
  it('ships published pages only — never drafts', async () => {
    respondWith({ docs: [page('home')] })

    const { getRenderablePages } = await loadPages('build')
    await getRenderablePages()

    expect(queries).toHaveLength(1)
    expect(queries[0]).toContain('where[_status][equals]=published')
    expect(queries[0]).not.toContain('draft=true')
  })

  it('requests the published version of a single page, not its latest edit', async () => {
    respondWith({ docs: [page('home')] })

    const { getRenderablePageBySlug } = await loadPages('build')
    await getRenderablePageBySlug('home')

    expect(queries[0]).toContain('where[and][1][_status][equals]=published')
    expect(queries[0]).not.toContain('draft=true')
  })

  it('prefers the prefetched snapshot over any HTTP call', async () => {
    readSnapshot.mockResolvedValue([page('home'), page('contact')])
    respondWith({ docs: [] })

    const { getRenderablePages } = await loadPages('build')
    const pages = await getRenderablePages()

    expect(pages.map((p) => p.slug)).toEqual(['home', 'contact'])
    expect(queries).toHaveLength(0)
  })

  it('falls back to HTTP when no snapshot is present', async () => {
    respondWith({ docs: [page('home')] })

    const { getRenderablePages } = await loadPages('build')

    expect((await getRenderablePages()).map((p) => p.slug)).toEqual(['home'])
    expect(queries).toHaveLength(1)
  })

  it('degrades to an empty list rather than failing the build', async () => {
    respondWith('error')

    const { getRenderablePages } = await loadPages('build')

    expect(await getRenderablePages()).toEqual([])
  })

  it('degrades to an empty list when the API is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('ECONNREFUSED')
      }),
    )

    const { getRenderablePages } = await loadPages('build')

    expect(await getRenderablePages()).toEqual([])
  })
})
