// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

/** Re-import image.ts with PAYLOAD_API_URL controlling the CAN_TRANSFORM gate. */
async function loadWith(apiUrl: string | undefined) {
  vi.resetModules()
  if (apiUrl === undefined) vi.stubEnv('PAYLOAD_API_URL', '')
  else vi.stubEnv('PAYLOAD_API_URL', apiUrl)
  return import('@rinsly-com/site-core/lib/image')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('cfImageSrc — transforms disabled (dev / same-origin)', () => {
  it('returns the URL untouched when PAYLOAD_API_URL is http localhost', async () => {
    const { cfImageSrc } = await loadWith('http://localhost:3000')
    const url = '/api/media/file/foto.jpg'
    expect(cfImageSrc(url, { width: 640 })).toBe(url)
  })

  it('returns the URL untouched when PAYLOAD_API_URL is unset', async () => {
    const { cfImageSrc } = await loadWith(undefined)
    expect(cfImageSrc('/api/media/file/foto.jpg')).toBe('/api/media/file/foto.jpg')
  })
})

describe('cfImageSrc — transforms enabled (https accp worker)', () => {
  const ORIGIN = 'https://accp.burojazz.workers.dev'

  it('rewrites a relative media URL through /cdn-cgi/image with defaults', async () => {
    const { cfImageSrc } = await loadWith(ORIGIN)
    expect(cfImageSrc('/api/media/file/foto.jpg')).toBe(
      `${ORIGIN}/cdn-cgi/image/format=auto,quality=75,fit=scale-down/api/media/file/foto.jpg`,
    )
  })

  it('includes width when provided', async () => {
    const { cfImageSrc } = await loadWith(ORIGIN)
    expect(cfImageSrc('/api/media/file/foto.jpg', { width: 828 })).toBe(
      `${ORIGIN}/cdn-cgi/image/format=auto,quality=75,fit=scale-down,width=828/api/media/file/foto.jpg`,
    )
  })

  it('honours quality and fit overrides', async () => {
    const { cfImageSrc } = await loadWith(ORIGIN)
    expect(cfImageSrc('/api/media/file/foto.jpg', { width: 640, quality: 60, fit: 'cover' })).toBe(
      `${ORIGIN}/cdn-cgi/image/format=auto,quality=60,fit=cover,width=640/api/media/file/foto.jpg`,
    )
  })

  it('preserves the query string of the original URL', async () => {
    const { cfImageSrc } = await loadWith(ORIGIN)
    expect(cfImageSrc('/api/media/file/foto.jpg?v=2', { width: 640 })).toContain(
      '/api/media/file/foto.jpg?v=2',
    )
  })

  it('keeps an absolute same-origin URL on the same origin', async () => {
    const { cfImageSrc } = await loadWith(ORIGIN)
    const out = cfImageSrc(`${ORIGIN}/api/media/file/foto.jpg`, { width: 640 })
    expect(out.startsWith(`${ORIGIN}/cdn-cgi/image/`)).toBe(true)
    expect(out.endsWith('/api/media/file/foto.jpg')).toBe(true)
  })
})

describe('cfImageSrcSet', () => {
  it('returns undefined when transforms are disabled', async () => {
    const { cfImageSrcSet } = await loadWith('http://localhost:3000')
    expect(cfImageSrcSet('/api/media/file/foto.jpg')).toBeUndefined()
  })

  it('emits one descriptor per device width when enabled', async () => {
    const { cfImageSrcSet } = await loadWith('https://accp.burojazz.workers.dev')
    const set = cfImageSrcSet('/api/media/file/foto.jpg')
    expect(set).toBeDefined()
    const entries = set!.split(', ')
    expect(entries).toHaveLength(5)
    expect(entries[0]).toMatch(/width=640\/api\/media\/file\/foto\.jpg 640w$/)
    expect(entries.at(-1)).toMatch(/width=2048\/api\/media\/file\/foto\.jpg 2048w$/)
  })

  it('threads quality/fit through every descriptor', async () => {
    const { cfImageSrcSet } = await loadWith('https://accp.burojazz.workers.dev')
    const set = cfImageSrcSet('/api/media/file/foto.jpg', { quality: 50, fit: 'cover' })!
    for (const entry of set.split(', ')) {
      expect(entry).toContain('quality=50')
      expect(entry).toContain('fit=cover')
    }
  })

  // REGRESSION: with sizes="56px" Media still emitted a full srcset up to 2048w
  // and a 1600w src fallback — old browsers / missing sizes over-fetched.
  it('trims candidates above maxWidth', async () => {
    const { cfImageSrcSet } = await loadWith('https://accp.burojazz.workers.dev')
    const set = cfImageSrcSet('/api/media/file/foto.jpg', {}, { maxWidth: 640 })!
    const entries = set.split(', ')
    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatch(/width=640.*640w$/)
  })
})

describe('cfImageSrc — SVG passthrough', () => {
  // REGRESSION: logos/icons went through /cdn-cgi/image/ with a full srcset.
  // Transforms cannot shrink an SVG. Returning the relative path unbroken
  // then 404'd on the static prod host (no /api/media) — absolutise instead.
  it('absolutises an SVG onto the media origin without /cdn-cgi/image/', async () => {
    const { cfImageSrc } = await loadWith('https://accp.burojazz.workers.dev')
    expect(cfImageSrc('/api/media/file/logo.svg', { width: 1600 })).toBe(
      'https://accp.burojazz.workers.dev/api/media/file/logo.svg',
    )
  })

  it('emits no srcset for SVG', async () => {
    const { cfImageSrcSet } = await loadWith('https://accp.burojazz.workers.dev')
    expect(cfImageSrcSet('/api/media/file/logo.svg')).toBeUndefined()
  })
})

describe('srcWidthFromSizes', () => {
  it('maps a small px box to the 640 srcset step at 2× DPR', async () => {
    const { srcWidthFromSizes } = await loadWith('https://accp.burojazz.workers.dev')
    expect(srcWidthFromSizes('56px')).toBe(640)
  })

  it('maps 100vw to the 2048 ceiling at 2× DPR on a 1920 viewport', async () => {
    const { srcWidthFromSizes } = await loadWith('https://accp.burojazz.workers.dev')
    expect(srcWidthFromSizes('100vw')).toBe(2048)
  })

  it('uses the largest candidate in a sizes list', async () => {
    const { srcWidthFromSizes } = await loadWith('https://accp.burojazz.workers.dev')
    // 100vw at 1920×2 beats 398px×2 → 2048 ceiling
    expect(srcWidthFromSizes('(min-width: 768px) 398px, 100vw')).toBe(2048)
  })
})
