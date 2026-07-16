// @vitest-environment node
import { describe, expect, it } from 'vitest'

import {
  DSM_OPTIONS,
  PROBLEMATIEK_OPTIONS,
  SIBLING_TYPE_OPTIONS,
  VORM_VAN_HULP_OPTIONS,
  labelFor,
  type Option,
} from '@/lib/aanmeldingOptions'

const ALL_LISTS: [string, Option[]][] = [
  ['PROBLEMATIEK_OPTIONS', PROBLEMATIEK_OPTIONS],
  ['VORM_VAN_HULP_OPTIONS', VORM_VAN_HULP_OPTIONS],
  ['SIBLING_TYPE_OPTIONS', SIBLING_TYPE_OPTIONS],
  ['DSM_OPTIONS', DSM_OPTIONS],
]

describe('option lists (shared source of truth)', () => {
  it.each(ALL_LISTS)('%s has unique, non-empty values and labels', (_name, list) => {
    expect(list.length).toBeGreaterThan(0)
    const values = list.map((o) => o.value)
    expect(new Set(values).size).toBe(values.length)
    for (const opt of list) {
      expect(opt.value.trim()).not.toBe('')
      expect(opt.label.trim()).not.toBe('')
    }
  })

  it.each(ALL_LISTS)('%s uses slug-safe values (no spaces/uppercase)', (_name, list) => {
    for (const opt of list) {
      expect(opt.value).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('keeps the sibling/DSM values in sync with the form union types', () => {
    expect(SIBLING_TYPE_OPTIONS.map((o) => o.value)).toEqual(['broer', 'zus', 'nvt'])
    expect(DSM_OPTIONS.map((o) => o.value)).toEqual(['ja', 'nee'])
  })
})

describe('labelFor', () => {
  it('resolves a known value to its human label', () => {
    expect(labelFor(PROBLEMATIEK_OPTIONS, 'angst')).toBe('Angst')
    expect(labelFor(DSM_OPTIONS, 'ja')).toBe('Ja')
    expect(labelFor(VORM_VAN_HULP_OPTIONS, 'pmt')).toBe('PMT (Pychomotorische Therapie)')
  })

  it('falls back to the raw value when the option is unknown', () => {
    expect(labelFor(PROBLEMATIEK_OPTIONS, 'onbekend')).toBe('onbekend')
  })

  it('returns an empty string for empty / null / undefined input', () => {
    expect(labelFor(PROBLEMATIEK_OPTIONS, '')).toBe('')
    expect(labelFor(PROBLEMATIEK_OPTIONS, null)).toBe('')
    expect(labelFor(PROBLEMATIEK_OPTIONS, undefined)).toBe('')
  })

  it('resolves every value in every list back to a non-empty label', () => {
    for (const [, list] of ALL_LISTS) {
      for (const opt of list) {
        expect(labelFor(list, opt.value)).toBe(opt.label)
      }
    }
  })
})
