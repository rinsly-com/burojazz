/**
 * Footer fallback menu when the Footer global has no menu items.
 *
 * REGRESSION: the fallback label was "Klachtregeling" and the href was
 * `/#klachtregeling`, while the home section id is `klachtenregeling`.
 * Contact pointed at `/contact` instead of the contact-personen section.
 * The fallback anchors follow the home page, mapped onto the existing
 * labels, in that order: hulpverleningsvormen, over-ons, contact-personen
 * (Contact), klachtenregeling, vacatures.
 */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Footer } from '@/payload-types'
import { SiteFooter } from '@/components/frontend/SiteFooter'

vi.mock('@rinsly-com/site-core/ui', () => ({
  Media: () => null,
}))

vi.mock('@rinsly-com/site-core', () => ({
  cmsText: (value: unknown, fallback = '') => {
    if (typeof value !== 'string') return fallback
    return value.trim() ? value : ''
  },
}))

afterEach(cleanup)

const FALLBACK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Hulpverleningsvormen', href: '/#hulpverleningsvormen' },
  { label: 'Over ons', href: '/#over-ons' },
  { label: 'Contact', href: '/#contact-personen' },
  { label: 'Klachtenregeling', href: '/#klachtenregeling' },
  { label: 'Vacatures', href: '/#vacatures' },
]

function menuLinks() {
  const heading = screen.getByRole('heading', { name: 'Menu' })
  const list = heading.parentElement?.querySelector('ul')
  if (!list) throw new Error('footer menu list missing')
  return [...list.querySelectorAll('a')].map((anchor) => ({
    label: anchor.textContent,
    href: anchor.getAttribute('href'),
  }))
}

describe('footer fallback menu', () => {
  it('scrolls to the home sections in page order when the CMS menu is missing', () => {
    render(<SiteFooter footer={null} />)

    expect(menuLinks()).toEqual(FALLBACK_LINKS)
    expect(screen.queryByRole('link', { name: 'Klachtregeling' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Klachtenregeling' })?.getAttribute('href')).toBe(
      '/#klachtenregeling',
    )
  })

  it('uses the same fallback when the CMS menu is an empty list', () => {
    render(<SiteFooter footer={{ menuItems: [] } as Footer} />)
    expect(menuLinks()).toEqual(FALLBACK_LINKS)
  })

  it('keeps a CMS menu instead of the fallback', () => {
    render(
      <SiteFooter
        footer={
          {
            menuItems: [{ id: 'cms', label: 'Alleen CMS', type: 'external', url: '/cms' }],
          } as Footer
        }
      />,
    )
    expect(menuLinks()).toEqual([{ label: 'Alleen CMS', href: '/cms' }])
  })
})
