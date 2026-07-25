/**
 * hrefFor (src/components/frontend/ui/CMSLink.tsx) — resolves a CMS link field
 * to an href. The site is a onepager, so "link to a section of the home page"
 * (`/#anchor`) is the common case rather than the exotic one, and a link that
 * silently resolves to '#' is a dead nav item in production.
 */
import { describe, expect, it } from 'vitest'

import type { Page } from '@/payload-types'
import { hrefFor } from '../../src/components/frontend/ui/CMSLink'

const pageDoc = (slug: string) => ({ id: 1, slug, title: slug }) as Page

describe('external links', () => {
  it.each([
    ['an absolute URL', 'https://example.com/x', 'https://example.com/x'],
    ['a root-relative path', '/aanmelden', '/aanmelden'],
    ['a bare hash', '#contact', '#contact'],
  ])('passes through %s unchanged', (_label, url, expected) => {
    expect(hrefFor({ type: 'external', url })).toBe(expected)
  })

  it.each([
    ['an empty url', ''],
    ['a null url', null],
  ])('falls back to # for %s', (_label, url) => {
    expect(hrefFor({ type: 'external', url })).toBe('#')
  })
})

describe('internal page links', () => {
  it('links the home page to / rather than /home', () => {
    expect(hrefFor({ type: 'internal', page: pageDoc('home') })).toBe('/')
  })

  it('links any other page to its slug', () => {
    expect(hrefFor({ type: 'internal', page: pageDoc('vacatures') })).toBe('/vacatures')
  })

  it('appends a section anchor to the home page — the onepager nav case', () => {
    expect(hrefFor({ type: 'internal', page: pageDoc('home'), anchor: 'over-ons' })).toBe(
      '/#over-ons',
    )
  })

  it('appends a section anchor to a sub page', () => {
    expect(hrefFor({ type: 'internal', page: pageDoc('info'), anchor: 'faq' })).toBe('/info#faq')
  })

  it.each([
    ['a leading #', '#contact'],
    ['several leading #', '###contact'],
    ['surrounding whitespace', '  contact  '],
  ])('normalises an anchor written with %s', (_label, anchor) => {
    expect(hrefFor({ type: 'internal', page: pageDoc('home'), anchor })).toBe('/#contact')
  })

  it('ignores a whitespace-only anchor', () => {
    expect(hrefFor({ type: 'internal', page: pageDoc('home'), anchor: '   ' })).toBe('/')
  })

  it('falls back to the anchor alone when the page is only an id (depth 0)', () => {
    expect(hrefFor({ type: 'internal', page: 7, anchor: 'contact' })).toBe('#contact')
  })

  it('resolves to # when there is neither a populated page nor an anchor', () => {
    expect(hrefFor({ type: 'internal', page: 7 })).toBe('#')
  })
})

describe('missing input', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['an empty object', {}],
  ])('resolves %s to #', (_label, link) => {
    expect(hrefFor(link)).toBe('#')
  })
})
