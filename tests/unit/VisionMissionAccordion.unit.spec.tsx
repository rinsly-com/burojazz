/**
 * Vision & mission accordion: one card open at a time, the first on load,
 * and the open card can be collapsed. Open/close goes through
 * `@rinsly-com/ui/accordion`.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { VisionMissionAccordion } from '@/components/frontend/blocks/VisionMissionAccordion'

afterEach(cleanup)

const items = [
  { key: 'visie', heading: 'Onze visie', icon: <span>ster</span>, body: <p>Inclusief</p> },
  { key: 'missie', heading: 'Onze missie', icon: <span>hart</span>, body: <p>Elke dag</p> },
]

const button = (name: string) => screen.getByRole('button', { name: new RegExp(name) })

describe('VisionMissionAccordion', () => {
  it('opens the first card and lets a second card take its place', () => {
    render(<VisionMissionAccordion items={items} />)
    expect(button('Onze visie').getAttribute('aria-expanded')).toBe('true')
    expect(button('Onze missie').getAttribute('aria-expanded')).toBe('false')
    // Open card colour (teal) and the icon swap hang off the item's data-open.
    // The header also carries data-open, so look at the card (class "group").
    const card = button('Onze visie').closest('.group')
    expect(card?.hasAttribute('data-open')).toBe(true)
    expect(card?.className).toContain('bg-brand')

    fireEvent.click(button('Onze missie'))
    expect(button('Onze visie').getAttribute('aria-expanded')).toBe('false')
    expect(button('Onze missie').getAttribute('aria-expanded')).toBe('true')
  })

  it('collapses the open card when its header is clicked again', () => {
    render(<VisionMissionAccordion items={items} />)
    fireEvent.click(button('Onze visie'))
    expect(button('Onze visie').getAttribute('aria-expanded')).toBe('false')
    expect(button('Onze missie').getAttribute('aria-expanded')).toBe('false')
  })
})
