/**
 * Fetch header values copied into a plain object.
 *
 * Object-spread of a pair list uses index keys, so a Turnstile header returned
 * as `[['cf-turnstile-response', token]]` would never be sent.
 */
import { describe, expect, it } from 'vitest'

import { headerRecord } from '@/lib/headerRecord'

describe('headerRecord', () => {
  it('copies a plain object unchanged', () => {
    expect(headerRecord({ 'cf-turnstile-response': 'tok' })).toEqual({
      'cf-turnstile-response': 'tok',
    })
  })

  it('turns a pair list into named headers', () => {
    expect(headerRecord([['cf-turnstile-response', 'tok']])).toEqual({
      'cf-turnstile-response': 'tok',
    })
  })

  it('reads a Headers instance by name', () => {
    const headers = new Headers()
    headers.set('cf-turnstile-response', 'tok')
    expect(headerRecord(headers)).toEqual({ 'cf-turnstile-response': 'tok' })
  })
})
