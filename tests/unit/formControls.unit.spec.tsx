/**
 * Aanmelden controls are Base UI fields. Base UI regenerates ids on hydration,
 * so a label's `for` only stays attached when the control passes an explicit id.
 * Checkboxes keep `nativeButton` so that id lands on the visible button; setting
 * it false puts the id on the hidden input and the label points at nothing
 * you can see.
 */
import { act, createElement, type ReactElement } from 'react'
import { hydrateRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AanmeldenForm } from '@/components/frontend/aanmelden/AanmeldenForm'

vi.mock('@rinsly-com/site-core/ui', () => ({
  Turnstile: () => null,
  turnstileHeaders: () => ({}),
}))

const roots: Root[] = []

function labelPointsAtControl(root: ParentNode) {
  const labels = [...root.querySelectorAll('label')]
  expect(labels.length).toBeGreaterThan(0)
  for (const label of labels) {
    const id = label.getAttribute('for')
    if (!id) {
      expect(
        label.querySelector('input, textarea, select, button'),
        label.textContent ?? undefined,
      ).toBeTruthy()
      continue
    }
    const control = root.querySelector(`[id="${id.replace(/"/g, '')}"]`)
    expect(control, `label "${label.textContent}" for="${id}"`).toBeTruthy()
  }
}

function hydrate(ui: ReactElement) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  container.innerHTML = renderToString(ui)
  let root!: Root
  act(() => {
    root = hydrateRoot(container, ui)
  })
  roots.push(root)
  return container
}

afterEach(() => {
  for (const root of roots) root.unmount()
  roots.length = 0
  cleanup()
  document.body.innerHTML = ''
})

describe('Aanmelden control ids survive hydration', () => {
  it('keeps step-1 labels attached to their explicit ids', () => {
    const ui = createElement(AanmeldenForm)
    const ssr = document.createElement('div')
    ssr.innerHTML = renderToString(ui)
    labelPointsAtControl(ssr)

    const view = hydrate(ui)
    labelPointsAtControl(view)
    expect(view.querySelector('label[for="aanmelden-client-naam"]')).toBeTruthy()
    expect(view.querySelector('#aanmelden-client-naam')).toBeInstanceOf(HTMLInputElement)
    expect(view.querySelector('label[for="aanmelden-verwijzer-email"]')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Verder/ })).toBeTruthy()
  })

  it('keeps the privacy checkbox id on the visible button', () => {
    render(<AanmeldenForm />)
    fireEvent.change(screen.getByLabelText(/Naam client/), { target: { value: 'Jip' } })
    fireEvent.change(screen.getByLabelText(/Geboortedatum/), { target: { value: '2012-05-04' } })
    fireEvent.change(screen.getByLabelText(/Adres en woonplaats/), {
      target: { value: 'Dorpsstraat 1' },
    })
    fireEvent.change(screen.getByLabelText(/Naam verwijzer/), { target: { value: 'Jansen' } })
    fireEvent.change(screen.getByLabelText(/Organisatie/), { target: { value: 'Wijkteam' } })
    fireEvent.change(screen.getByLabelText(/Email adres/), {
      target: { value: 'jansen@wijkteam.nl' },
    })
    fireEvent.change(screen.getByLabelText(/Telefoonnr\./), { target: { value: '0612345678' } })
    fireEvent.click(screen.getByRole('button', { name: /Verder/ }))

    fireEvent.change(screen.getByLabelText(/Naam moeder\/verzorgster/), { target: { value: 'A' } })
    fireEvent.change(screen.getByLabelText(/Adres en woonplaats moeder\/verzorgster/), {
      target: { value: 'Dorpsstraat 1' },
    })
    fireEvent.change(screen.getAllByLabelText(/Email adres/)[0], {
      target: { value: 'moeder@example.nl' },
    })
    fireEvent.change(screen.getAllByLabelText(/Telefoonnr\./)[0], {
      target: { value: '0612345678' },
    })
    fireEvent.change(screen.getByLabelText(/Naam vader\/verzorger/), { target: { value: 'B' } })
    fireEvent.click(screen.getByRole('button', { name: /Verder/ }))

    fireEvent.change(screen.getByLabelText(/Beschrijf kort en bondig/), {
      target: { value: 'reden' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Verder/ }))

    const privacy = screen.getByRole('checkbox', { name: /privacyverklaring/ })
    expect(privacy.tagName).toBe('BUTTON')
    expect(privacy.getAttribute('id')).toBe('aanmelden-privacy')
    expect(document.querySelector('label[for="aanmelden-privacy"]')).toBeTruthy()
    labelPointsAtControl(document.body)
  })
})
