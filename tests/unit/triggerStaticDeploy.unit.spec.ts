/**
 * src/hooks/triggerStaticDeploy.ts — the GitHub `repository_dispatch` call
 * behind the admin "Deploy now" button.
 *
 * Two properties matter beyond the happy path:
 * - it must NEVER throw (a webhook failure must not break the editor's save);
 * - it must stay a *manual* action. Production used to be rebuilt by every
 *   publish, draft save and Header/Footer save, which made Actions runs look
 *   random. The module must therefore export the trigger and nothing that
 *   auto-fires it.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Payload } from 'payload'

import * as deployModule from '../../src/hooks/triggerStaticDeploy'
import { triggerDeploy } from '../../src/hooks/triggerStaticDeploy'

const URL_VAR = 'https://api.github.com/repos/acme/site/dispatches'
const TOKEN = 'ghp_test'

/**
 * `wrangler types` declares these vars as required string literals, so tests
 * cannot assign or delete them through the typed `process.env`.
 */
const env = process.env as unknown as Record<string, string | undefined>

const logger = () => ({ info: vi.fn(), error: vi.fn() })
const payloadWith = (log = logger()) => ({ logger: log }) as unknown as Payload

const okResponse = { ok: true, status: 204 } as unknown as Response

beforeEach(() => {
  env.DEPLOY_DISPATCH_URL = URL_VAR
  env.DEPLOY_DISPATCH_TOKEN = TOKEN
  delete env.DEPLOY_DISPATCH_EVENT
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete env.DEPLOY_DISPATCH_URL
  delete env.DEPLOY_DISPATCH_TOKEN
  delete env.DEPLOY_DISPATCH_EVENT
})

describe('triggerDeploy', () => {
  it('POSTs a deploy-static dispatch carrying the reason', async () => {
    const fetchMock = vi.fn(async () => okResponse)
    vi.stubGlobal('fetch', fetchMock)

    const result = await triggerDeploy(payloadWith(), 'manual deploy by editor@example.com')

    expect(result.status).toBe('triggered')
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(URL_VAR)
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual({
      event_type: 'deploy-static',
      client_payload: { reason: 'manual deploy by editor@example.com' },
    })
  })

  it('authenticates with the configured token', async () => {
    const fetchMock = vi.fn(async () => okResponse)
    vi.stubGlobal('fetch', fetchMock)

    await triggerDeploy(payloadWith(), 'why')

    const headers = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
      .headers as Record<string, string>
    expect(headers.Authorization).toBe(`Bearer ${TOKEN}`)
    expect(headers.Accept).toBe('application/vnd.github+json')
  })

  it('honours a custom event type', async () => {
    env.DEPLOY_DISPATCH_EVENT = 'rebuild-site'
    const fetchMock = vi.fn(async () => okResponse)
    vi.stubGlobal('fetch', fetchMock)

    await triggerDeploy(payloadWith(), 'why')

    const body = JSON.parse(
      String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body),
    )
    expect(body.event_type).toBe('rebuild-site')
  })

  it.each([
    ['the URL', 'DEPLOY_DISPATCH_URL'],
    ['the token', 'DEPLOY_DISPATCH_TOKEN'],
  ])('skips (never fails) when %s is not configured', async (_label, missing) => {
    delete env[missing]
    const fetchMock = vi.fn(async () => okResponse)
    vi.stubGlobal('fetch', fetchMock)

    const result = await triggerDeploy(payloadWith(), 'local dev')

    expect(result.status).toBe('skipped')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reports a non-OK response as failed rather than throwing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 401 }) as unknown as Response))
    const log = logger()

    const result = await triggerDeploy(payloadWith(log), 'why')

    expect(result.status).toBe('failed')
    expect(result.message).toContain('401')
    expect(log.error).toHaveBeenCalled()
  })

  it('swallows a network error so a save is never broken by a webhook', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('getaddrinfo ENOTFOUND')
      }),
    )

    const result = await triggerDeploy(payloadWith(), 'why')

    expect(result.status).toBe('failed')
    expect(result.message).toContain('ENOTFOUND')
  })

  it('surfaces the reason in the log line, so a run can be attributed', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => okResponse))
    const log = logger()

    await triggerDeploy(payloadWith(log), 'manual deploy by ann@example.com')

    expect(String(log.info.mock.calls[0]?.[0])).toContain('manual deploy by ann@example.com')
  })
})

describe('deploying stays manual', () => {
  it('exports no collection/global hook that would auto-deploy', () => {
    // REGRESSION: afterChange/afterDelete hooks here rebuilt production on every
    // publish, every draft save of a live page, and every Header/Footer save.
    expect(Object.keys(deployModule).filter((k) => /^triggerStaticDeploy/.test(k))).toEqual([])
    expect(Object.keys(deployModule)).toContain('triggerDeploy')
  })
})
