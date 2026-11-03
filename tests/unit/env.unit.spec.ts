/**
 * Env readers. A value that is not the type we will actually call (URL, email)
 * falls back to the same default the call site used to use, and the log names
 * the variable without echoing the value.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { envEmail, envUrl, validatePublicUrl } from '@/lib/env'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('envUrl', () => {
  it('returns a well-formed URL unchanged', () => {
    vi.stubEnv('PAYLOAD_API_URL', 'https://accp.example.com///')
    expect(envUrl('PAYLOAD_API_URL', 'http://localhost:3000')).toBe('https://accp.example.com///')
  })

  it('falls back when the value is not a URL and does not log the value', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubEnv('PAYLOAD_API_URL', 'not a url')
    expect(envUrl('PAYLOAD_API_URL', 'http://localhost:3000')).toBe('http://localhost:3000')
    expect(warn).toHaveBeenCalledWith(expect.objectContaining({ code: 'ENV_INVALID', name: 'PAYLOAD_API_URL' }))
    expect(JSON.stringify(warn.mock.calls)).not.toContain('not a url')
  })

  it('uses the fallback when the variable is unset', () => {
    vi.stubEnv('PAYLOAD_API_URL', '')
    expect(envUrl('PAYLOAD_API_URL', 'http://localhost:3000')).toBe('http://localhost:3000')
  })
})

describe('envEmail', () => {
  it('keeps a valid address and falls back on a display name', () => {
    vi.stubEnv('EMAIL_FROM_ADDRESS', 'aanmelden@burojazz.com')
    expect(envEmail('EMAIL_FROM_ADDRESS', 'fallback@burojazz.com')).toBe('aanmelden@burojazz.com')
    vi.stubEnv('EMAIL_FROM_ADDRESS', 'Buro J.A.Z.Z. website')
    expect(envEmail('EMAIL_FROM_ADDRESS', 'fallback@burojazz.com')).toBe('fallback@burojazz.com')
  })
})

describe('validatePublicUrl', () => {
  it('preserves an empty base (same-origin) and a real origin', () => {
    expect(validatePublicUrl('NEXT_PUBLIC_PAYLOAD_API_URL', undefined)).toBe('')
    expect(validatePublicUrl('NEXT_PUBLIC_PAYLOAD_API_URL', 'https://accp.burojazz.com')).toBe(
      'https://accp.burojazz.com',
    )
  })
})
