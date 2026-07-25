/**
 * cmsText (@rinsly-com/site-core) — how a CMS text field is read for display.
 *
 * REGRESSION: this shipped to production. A text field the editor typed into and
 * then cleared comes back as `''`, not `null`, so `value ?? 'Default'` never
 * fired and the block rendered an EMPTY element. The vacancies eyebrow was an
 * empty `<p>` on burojazz.nl because the published value was `''`.
 *
 * The contract:
 * - cleared ('' or whitespace) -> '' so the caller renders nothing
 * - never set (null/undefined)  -> the fallback, for content predating the field
 */
import { describe, expect, it } from 'vitest'

import { cmsText } from '@rinsly-com/site-core'

describe('cleared fields render nothing', () => {
  it.each([
    ['an empty string', ''],
    ['a single space', ' '],
    ['several spaces', '   '],
    ['a tab', '\t'],
    ['a newline', '\n'],
    ['mixed whitespace', ' \t\n '],
  ])('returns empty for %s, even with a fallback available', (_label, value) => {
    expect(cmsText(value, 'Vacatures')).toBe('')
  })

  it('is falsy, so `{value && <El/>}` omits the element', () => {
    // This is the property the render guards depend on.
    expect(Boolean(cmsText('', 'Vacatures'))).toBe(false)
  })
})

describe('unset fields fall back', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
  ])('returns the fallback for %s', (_label, value) => {
    expect(cmsText(value, 'Vacatures')).toBe('Vacatures')
  })

  it('returns empty when unset and no fallback is given', () => {
    expect(cmsText(null)).toBe('')
    expect(cmsText(undefined)).toBe('')
  })
})

describe('real values win', () => {
  it('returns the editor value over the fallback', () => {
    expect(cmsText('Test', 'Vacatures')).toBe('Test')
  })

  it('preserves surrounding whitespace rather than trimming the output', () => {
    // Trimming is only used to DECIDE emptiness, not to rewrite copy.
    expect(cmsText('  Test  ', 'Vacatures')).toBe('  Test  ')
  })

  it.each([
    ['a zero', '0'],
    ['a dash', '-'],
    ['punctuation', '—'],
  ])('treats %s as real content', (_label, value) => {
    expect(cmsText(value, 'Fallback')).toBe(value)
  })
})

describe('the exact production case', () => {
  it('published eyebrow of "" renders nothing, not an empty paragraph', () => {
    expect(cmsText('', 'Vacatures')).toBe('')
  })

  it('the draft value "Test" still renders on the preview environment', () => {
    expect(cmsText('Test', 'Vacatures')).toBe('Test')
  })
})
