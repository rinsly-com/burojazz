/**
 * Catch logs are a fixed code plus a short allow-listed context. Tokens, URLs
 * and addresses must not survive into the log line.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LogCode, logCode } from '@/lib/logCode'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('logCode', () => {
  it('logs the code and drops a token, a URL and an email address', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    logCode('error', LogCode.DEPLOY_DISPATCH_FAILED, {
      status: 502,
      name: 'Bearer ghp_secret',
      slug: 'https://api.github.com/repos/acme/site?access_token=abc',
      collection: 'editor@example.com',
    })
    expect(error).toHaveBeenCalledTimes(1)
    const entry = error.mock.calls[0]?.[0] as Record<string, unknown>
    expect(entry.code).toBe('DEPLOY_DISPATCH_FAILED')
    expect(entry.status).toBe(502)
    expect(entry).not.toHaveProperty('name')
    expect(entry).not.toHaveProperty('slug')
    expect(entry).not.toHaveProperty('collection')
    expect(JSON.stringify(entry)).not.toContain('ghp_secret')
    expect(JSON.stringify(entry)).not.toContain('example.com')
  })
})
