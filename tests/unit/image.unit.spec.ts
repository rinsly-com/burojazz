// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

/** Re-import image.ts with PAYLOAD_API_URL controlling the CAN_TRANSFORM gate. */
async function loadWith(apiUrl: string | undefined) {
  vi.resetModules()
  if (apiUrl === undefined) vi.stubEnv('PAYLOAD_API_URL', '')
  else vi.stubEnv('PAYLOAD_API_URL', apiUrl)
  return import('@/lib/image')
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
      `${ORIGIN}/cdn-cgi/image/format=auto,quality=82,fit=scale-down/api/media/file/foto.jpg`,
    )
  })

  it('includes width when provided', async () => {
    const { cfImageSrc } = await loadWith(ORIGIN)
    expect(cfImageSrc('/api/media/file/foto.jpg', { width: 828 })).toBe(
      `${ORIGIN}/cdn-cgi/image/format=auto,quality=82,fit=scale-down,width=828/api/media/file/foto.jpg`,
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
    expect(entries).toHaveLength(6)
    expect(entries[0]).toMatch(/width=640\/api\/media\/file\/foto\.jpg 640w$/)
    expect(entries.at(-1)).toMatch(/width=3840\/api\/media\/file\/foto\.jpg 3840w$/)
  })

  it('threads quality/fit through every descriptor', async () => {
    const { cfImageSrcSet } = await loadWith('https://accp.burojazz.workers.dev')
    const set = cfImageSrcSet('/api/media/file/foto.jpg', { quality: 50, fit: 'cover' })!
    for (const entry of set.split(', ')) {
      expect(entry).toContain('quality=50')
      expect(entry).toContain('fit=cover')
    }
  })
})
