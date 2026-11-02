/**
 * Services tabs and the read-more dialog. Tabs come from `@rinsly-com/ui/tabs`;
 * the dialog is the shared Modal. Switching tabs closes an open card because
 * the card index belongs to the tab that was showing.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ServicesTabs, type TabData } from '@/components/frontend/blocks/ServicesTabs'

afterEach(cleanup)

const tabs: TabData[] = [
  {
    id: 'ambulant',
    label: 'Ambulant',
    cards: [
      {
        id: 'een',
        title: 'Begeleiding',
        description: 'Thuis',
        detailsNode: <p>Lang verhaal</p>,
      },
      {
        id: 'twee',
        title: 'Externe site',
        description: 'Weg',
        link: { type: 'external', url: 'https://example.com', label: 'Website' },
      },
    ],
  },
  {
    id: 'verblijf',
    label: 'Verblijf',
    cards: [{ id: 'drie', title: 'Wonen', description: 'Op locatie' }],
  },
]

describe('ServicesTabs', () => {
  it('shows the selected tab panel and hides the other', () => {
    render(<ServicesTabs tabs={tabs} />)
    expect(screen.getByRole('tab', { name: 'Ambulant' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('heading', { name: 'Begeleiding' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Wonen' })).toBeNull()

    fireEvent.click(screen.getByRole('tab', { name: 'Verblijf' }))
    expect(screen.getByRole('tab', { name: 'Verblijf' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('heading', { name: 'Wonen' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Begeleiding' })).toBeNull()
  })

  it('opens the read-more dialog for a card with details and closes it when the tab changes', () => {
    render(<ServicesTabs tabs={tabs} />)
    fireEvent.click(screen.getByRole('button', { name: /Lees verder/ }))
    expect(screen.getByRole('dialog', { name: 'Begeleiding' })).toBeTruthy()
    expect(screen.getByText('Lang verhaal')).toBeTruthy()

    // The open dialog marks the rest of the page inert, same as showModal().
    fireEvent.click(screen.getByRole('tab', { name: 'Verblijf', hidden: true }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('keeps a real link as a link', () => {
    render(<ServicesTabs tabs={tabs} />)
    const link = screen.getByRole('link', { name: 'Website' })
    expect(link.getAttribute('href')).toBe('https://example.com')
  })
})
