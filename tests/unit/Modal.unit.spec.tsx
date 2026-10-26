/**
 * Modal is the burojazz skin over `@rinsly-com/ui/dialog`.
 * It must trap the accessible name, close from the button and from Escape,
 * and only mount children while open so the aanmelden wizard starts fresh.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Modal } from '@/components/frontend/ui/Modal'

afterEach(cleanup)

describe('Modal', () => {
  it('names the dialog from label and unmounts children while closed', () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <Modal open={false} onClose={onClose} label="Direct aanmelden">
        <p>formulier</p>
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByText('formulier')).toBeNull()

    rerender(
      <Modal open onClose={onClose} label="Direct aanmelden">
        <p>formulier</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: 'Direct aanmelden' })).toBeTruthy()
    expect(screen.getByText('formulier')).toBeTruthy()
  })

  it('closes from the Sluiten button', () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} label="Direct aanmelden">
        <p>formulier</p>
      </Modal>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Sluiten' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('uses the labelled heading as the dialog name', () => {
    render(
      <Modal open onClose={() => {}} labelledBy="service-details-title">
        <h2 id="service-details-title">Ambulante hulp</h2>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.getAttribute('aria-labelledby')).toBe('service-details-title')
    expect(screen.getByRole('heading', { name: 'Ambulante hulp' })).toBeTruthy()
  })
})
