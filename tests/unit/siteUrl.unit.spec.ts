// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('SITE_URL / SITE_NAME (module-load env)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('defaults to https://burojazz.nl when unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.resetModules()
    const { SITE_URL, SITE_NAME } = await import('@/lib/siteUrl')
    expect(SITE_URL).toBe('https://burojazz.nl')
    expect(SITE_NAME).toBe('Buro J.A.Z.Z.')
  })

  it('honours NEXT_PUBLIC_SITE_URL and strips trailing slashes', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://accp.example.com///')
    vi.resetModules()
    const { SITE_URL } = await import('@/lib/siteUrl')
    expect(SITE_URL).toBe('https://accp.example.com')
  })
})

describe('absoluteUrl', () => {
  it('builds an absolute URL on the canonical origin from a root-relative path', async () => {
    const { absoluteUrl } = await import('@/lib/siteUrl')
    expect(absoluteUrl('/over-ons')).toBe('https://burojazz.nl/over-ons')
  })

  it('defaults to the site root when called with no argument', async () => {
    const { absoluteUrl } = await import('@/lib/siteUrl')
    expect(absoluteUrl()).toBe('https://burojazz.nl/')
  })

  it('resolves a bare (non-slash-prefixed) path against the origin root', async () => {
    const { absoluteUrl } = await import('@/lib/siteUrl')
    expect(absoluteUrl('favicon.ico')).toBe('https://burojazz.nl/favicon.ico')
  })

  it('preserves query strings and hashes', async () => {
    const { absoluteUrl } = await import('@/lib/siteUrl')
    expect(absoluteUrl('/zoeken?q=zorg#top')).toBe('https://burojazz.nl/zoeken?q=zorg#top')
  })
})
