/**
 * The brand button is `@rinsly-com/ui/button` composed onto next/link.
 * The fork used to render the link itself; the classes and href stay.
 */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Button } from '@/components/frontend/ui/Button'

afterEach(cleanup)

describe('Button', () => {
  it('renders a primary link with the brand classes', () => {
    render(<Button label="Direct aanmelden" href="/aanmelden" />)
    const link = screen.getByRole('link', { name: /Direct aanmelden/ })
    expect(link.getAttribute('href')).toBe('/aanmelden')
    expect(link.className).toContain('bg-brand')
    expect(link.className).toContain('rounded-pill')
  })

  it('renders a secondary link that opens in a new tab', () => {
    render(<Button label="Neem contact op" href="/contact" variant="secondary" newTab />)
    const link = screen.getByRole('link', { name: /Neem contact op/ })
    expect(link.getAttribute('href')).toBe('/contact')
    expect(link.className).toContain('text-brand')
    expect(link.className).not.toContain('bg-brand')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })
})
