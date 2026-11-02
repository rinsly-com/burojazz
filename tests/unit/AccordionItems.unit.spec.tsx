/**
 * Accordion block items: several can be open at once and they start closed,
 * matching the old `<details>` list. Triggers come from
 * `@rinsly-com/ui/accordion`.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { AccordionItems } from '@/components/frontend/blocks/AccordionItems'

afterEach(cleanup)

const items = [
  { value: 'a', title: 'Vraag een', body: <p>Antwoord een</p> },
  { value: 'b', title: 'Vraag twee', body: <p>Antwoord twee</p> },
]

const button = (name: string) => screen.getByRole('button', { name: new RegExp(name) })

describe('AccordionItems', () => {
  it('starts closed and lets more than one item stay open', () => {
    render(<AccordionItems items={items} />)
    expect(button('Vraag een').getAttribute('aria-expanded')).toBe('false')
    expect(button('Vraag twee').getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(button('Vraag een'))
    fireEvent.click(button('Vraag twee'))
    expect(button('Vraag een').getAttribute('aria-expanded')).toBe('true')
    expect(button('Vraag twee').getAttribute('aria-expanded')).toBe('true')
    // The plus glyph rotates off the item's data-open (the card has class "group").
    expect(button('Vraag een').closest('.group')?.hasAttribute('data-open')).toBe(true)
    expect(button('Vraag twee').closest('.group')?.hasAttribute('data-open')).toBe(true)
    expect(screen.getByText('Antwoord een')).toBeTruthy()
    expect(screen.getByText('Antwoord twee')).toBeTruthy()
  })
})
