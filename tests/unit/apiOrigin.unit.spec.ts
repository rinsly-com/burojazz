/**
 * src/lib/apiOrigin.ts — which origin the HTTP content helpers fetch from.
 *
 * Getting this wrong is not a subtle failure: the static build would fetch from
 * localhost and ship an empty site, or the accp worker would serve another
 * environment's content.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { headers } = vi.hoisted(() => ({ headers: vi.fn() }))

vi.mock('next/headers', () => ({ headers }))

/**
 * `wrangler types` declares these vars as required string literals, so tests
 * cannot assign or delete them through the typed `process.env`.
 */
const env = process.env as unknown as Record<string, string | undefined>

/** A minimal stand-in for Next's read-only headers object. */
const requestHeaders = (map: Record<string, string>) => ({
  get: (key: string) => map[key.toLowerCase()] ?? null,
})

async function loadApiOrigin(mode: 'build' | 'runtime') {
  vi.resetModules()
  if (mode === 'build') env.BUILD_STATIC = 'true'
  else delete env.BUILD_STATIC
  return (await import('../../src/lib/apiOrigin')).apiOrigin
}

beforeEach(() => {
  headers.mockResolvedValue(requestHeaders({}))
})

afterEach(() => {
  delete env.BUILD_STATIC
  delete env.PAYLOAD_API_URL
})

describe('static production build', () => {
  it('uses the configured PAYLOAD_API_URL', async () => {
    env.PAYLOAD_API_URL = 'https://accp.burojazz.com'

    expect(await (await loadApiOrigin('build'))()).toBe('https://accp.burojazz.com')
  })

  it('never reads request headers — there is no request during a build', async () => {
    env.PAYLOAD_API_URL = 'https://accp.burojazz.com'

    await (await loadApiOrigin('build'))()

    expect(headers).not.toHaveBeenCalled()
  })

  it('falls back to localhost when PAYLOAD_API_URL is unset', async () => {
    expect(await (await loadApiOrigin('build'))()).toBe('http://localhost:3000')
  })
})

describe('worker / dev runtime', () => {
  it('derives the origin from the incoming request, so it self-fetches', async () => {
    headers.mockResolvedValue(
      requestHeaders({ host: 'accp.burojazz.com', 'x-forwarded-proto': 'https' }),
    )

    expect(await (await loadApiOrigin('runtime'))()).toBe('https://accp.burojazz.com')
  })

  it('honours the forwarded protocol', async () => {
    headers.mockResolvedValue(requestHeaders({ host: 'localhost:3000', 'x-forwarded-proto': 'http' }))

    expect(await (await loadApiOrigin('runtime'))()).toBe('http://localhost:3000')
  })

  it('assumes https when no protocol is forwarded', async () => {
    headers.mockResolvedValue(requestHeaders({ host: 'accp.burojazz.com' }))

    expect(await (await loadApiOrigin('runtime'))()).toBe('https://accp.burojazz.com')
  })

  it('ignores PAYLOAD_API_URL at runtime — content is always same-origin', async () => {
    env.PAYLOAD_API_URL = 'https://somewhere-else.example'
    headers.mockResolvedValue(requestHeaders({ host: 'accp.burojazz.com' }))

    expect(await (await loadApiOrigin('runtime'))()).toBe('https://accp.burojazz.com')
  })

  it('falls back to localhost when the request carries no host', async () => {
    expect(await (await loadApiOrigin('runtime'))()).toBe('http://localhost:3000')
  })

  it('lets a headers() bailout propagate, so the route renders dynamically', async () => {
    // Next throws a special error from headers() to force dynamic rendering.
    // Swallowing it would freeze the page at build time.
    headers.mockRejectedValue(new Error('Dynamic server usage'))

    await expect((await loadApiOrigin('runtime'))()).rejects.toThrow('Dynamic server usage')
  })
})
