// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AanmeldenForm } from '@/components/frontend/aanmelden/AanmeldenForm'

afterEach(cleanup)

const setInput = (label: RegExp | string, value: string, index = 0) => {
  const els = screen.getAllByLabelText(label)
  fireEvent.change(els[index], { target: { value } })
}

/** Fill the two steps that gate submission with their required fields. */
function fillStep1() {
  setInput(/Naam client/, 'Jip de Vries')
  setInput(/Geboortedatum/, '2012-05-04')
  setInput(/Adres en woonplaats/, 'Dorpsstraat 1, Utrecht')
  setInput(/Naam verwijzer/, 'Mw. Jansen')
  setInput(/Organisatie/, 'Wijkteam Noord')
  setInput(/Email adres/, 'jansen@wijkteam.nl') // verwijzerEmail (only email on step 1)
  setInput(/Telefoonnr\./, '0612345678')
}

describe('AanmeldenForm wizard', () => {
  it('blocks advancing while required fields are empty', () => {
    render(createElement(AanmeldenForm))
    // Step 1 heading present.
    expect(screen.getByRole('heading', { name: 'Persoonsgegevens' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Verder/ }))

    // Still on step 1, and required errors are shown.
    expect(screen.getByRole('heading', { name: 'Persoonsgegevens' })).toBeTruthy()
    expect(screen.getAllByText('Dit veld is verplicht').length).toBeGreaterThan(0)
  })

  it('rejects an invalid email format', () => {
    render(createElement(AanmeldenForm))
    setInput(/Email adres/, 'not-an-email')
    fireEvent.click(screen.getByRole('button', { name: /Verder/ }))
    expect(screen.getByText('Ongeldig e-mailadres')).toBeTruthy()
  })

  it('advances to step 2 once step 1 is valid', () => {
    render(createElement(AanmeldenForm))
    fillStep1()
    fireEvent.click(screen.getByRole('button', { name: /Verder/ }))
    expect(screen.getByRole('heading', { name: 'Ouders / verzorgers' })).toBeTruthy()
  })

  it('walks all 4 steps and submits to the endpoint, showing success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201 } as Response)
    vi.stubGlobal('fetch', fetchMock)

    render(createElement(AanmeldenForm))

    // Step 1
    fillStep1()
    fireEvent.click(screen.getByRole('button', { name: /Verder/ }))

    // Step 2 — fill required (moeder x4 + vader naam)
    setInput(/Naam moeder\/verzorgster/, 'A. de Vries')
    setInput(/Adres en woonplaats moeder\/verzorgster/, 'Dorpsstraat 1, Utrecht')
    setInput(/Email adres/, 'moeder@example.nl', 0) // moeder row renders first
    setInput(/Telefoonnr\./, '0612345678', 0)
    setInput(/Naam vader\/verzorger/, 'B. de Vries')
    fireEvent.click(screen.getByRole('button', { name: /Verder/ }))

    // Step 3
    expect(screen.getByRole('heading', { name: 'Reden van aanmelden' })).toBeTruthy()
    setInput(/Beschrijf kort en bondig/, 'Ondersteuning bij emotieregulatie.')
    fireEvent.click(screen.getByRole('button', { name: /Verder/ }))

    // Step 4 — must accept privacy before submit
    expect(screen.getByRole('heading', { name: 'Hulpvraag' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Verstuur bericht/ }))
    // Blocked without consent.
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByText(/akkoord te gaan met de privacyverklaring/)).toBeTruthy()

    // Tick the privacy consent (the checkbox inside the akkoord label).
    const consentLabel = screen.getByText(/Ik ga akkoord met de verwerking/).closest('label')!
    fireEvent.click(within(consentLabel).getByRole('checkbox'))

    fireEvent.click(screen.getByRole('button', { name: /Verstuur bericht/ }))

    // Wait a microtask for the async submit handler.
    await screen.findByText('Bedankt voor uw aanmelding')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/api/aanmeldingen/submit')
    const body = JSON.parse((init as RequestInit).body as string)
    expect(body.clientNaam).toBe('Jip de Vries')
    expect(body.privacyAkkoord).toBe(true)
    expect(body.website).toBe('') // honeypot stays empty
  })
})
