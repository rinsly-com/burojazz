/**
 * The brand link renders next/link itself. Composing ui/button onto the link
 * added tabindex="0" and Space-to-activate, which a link does not do.
 */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Button } from '@/components/frontend/ui/Button'

afterEach(cleanup)

describe('Button', () => {
  it('renders a primary link with the brand classes', () => {
    render(<Button label="Direct aanmelden" href="/aanmelden" />)
    const link = screen.getByRole('link', { name: /Direct aanmelden/ })
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('/aanmelden')
    expect(link.hasAttribute('tabindex')).toBe(false)
    expect(link.getAttribute('role')).toBeNull()
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
