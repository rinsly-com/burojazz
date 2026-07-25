import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AanmeldenForm } from '@/components/frontend/aanmelden/AanmeldenForm'

afterEach(cleanup)

const setInput = (label: RegExp | string, value: string, index = 0) => {
  fireEvent.change(screen.getAllByLabelText(label)[index], { target: { value } })
}

function fillStep1() {
  setInput(/Naam client/, 'Jip de Vries')
  setInput(/Geboortedatum/, '2012-05-04')
  setInput(/Adres en woonplaats/, 'Dorpsstraat 1, Utrecht')
  setInput(/Naam verwijzer/, 'Mw. Jansen')
  setInput(/Organisatie/, 'Wijkteam Noord')
  setInput(/Email adres/, 'jansen@wijkteam.nl')
  setInput(/Telefoonnr\./, '0612345678')
}

function fillStep2() {
  setInput(/Naam moeder\/verzorgster/, 'A. de Vries')
  setInput(/Adres en woonplaats moeder\/verzorgster/, 'Dorpsstraat 1, Utrecht')
  setInput(/Email adres/, 'moeder@example.nl', 0)
  setInput(/Telefoonnr\./, '0612345678', 0)
  setInput(/Naam vader\/verzorger/, 'B. de Vries')
}

const clickVerder = () => fireEvent.click(screen.getByRole('button', { name: /Verder/ }))

describe('AanmeldenForm — navigation', () => {
  it('goes back to the previous step and clears errors', () => {
    render(<AanmeldenForm />)
    fillStep1()
    clickVerder()
    expect(screen.getByRole('heading', { name: 'Ouders / verzorgers' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Terug/ }))
    expect(screen.getByRole('heading', { name: 'Persoonsgegevens' })).toBeTruthy()
  })

  it('has no Back button on the first step', () => {
    render(<AanmeldenForm />)
    expect(screen.queryByRole('button', { name: /Terug/ })).toBeNull()
  })

  it('clears a field error as soon as the field is edited', () => {
    render(<AanmeldenForm />)
    clickVerder()
    expect(screen.getAllByText('Dit veld is verplicht').length).toBeGreaterThan(0)

    fillStep1()
    // Fixing the fields removes their required messages.
    expect(screen.queryByText('Dit veld is verplicht')).toBeNull()
  })
})

describe('AanmeldenForm — submission', () => {
  beforeEach(() => vi.unstubAllGlobals())
  afterEach(() => vi.unstubAllGlobals())

  async function advanceToStep4() {
    fillStep1()
    clickVerder()
    fillStep2()
    clickVerder()
    setInput(/Beschrijf kort en bondig/, 'Ondersteuning bij emotieregulatie.')
    clickVerder()
    // Accept privacy.
    const consentLabel = screen.getByText(/Ik ga akkoord met de verwerking/).closest('label')!
    fireEvent.click(within(consentLabel).getByRole('checkbox'))
  }

  it('shows the error panel and stays on the form when the endpoint fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response))
    render(<AanmeldenForm />)
    await advanceToStep4()

    fireEvent.click(screen.getByRole('button', { name: /Verstuur bericht/ }))
    expect(await screen.findByText(/Er ging iets mis bij het versturen/)).toBeTruthy()
    // Not the success screen.
    expect(screen.queryByText('Bedankt voor uw aanmelding')).toBeNull()
  })

  it('shows the error panel when fetch rejects (network error)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    render(<AanmeldenForm />)
    await advanceToStep4()

    fireEvent.click(screen.getByRole('button', { name: /Verstuur bericht/ }))
    expect(await screen.findByText(/Er ging iets mis bij het versturen/)).toBeTruthy()
  })

  it('sends an empty honeypot field and calls onDone on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201 } as Response)
    vi.stubGlobal('fetch', fetchMock)
    const onDone = vi.fn()

    render(<AanmeldenForm onDone={onDone} />)
    await advanceToStep4()
    fireEvent.click(screen.getByRole('button', { name: /Verstuur bericht/ }))

    await screen.findByText('Bedankt voor uw aanmelding')
    expect(onDone).toHaveBeenCalledTimes(1)

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body.website).toBe('')
    expect(body.privacyAkkoord).toBe(true)
  })

  it('uses the configured privacy href on the consent link', async () => {
    render(<AanmeldenForm privacyHref="/eigen-privacy" />)
    fillStep1()
    clickVerder()
    fillStep2()
    clickVerder()
    setInput(/Beschrijf kort en bondig/, 'reden')
    clickVerder()
    const link = screen.getByRole('link', { name: /de privacyverklaring/ })
    expect(link.getAttribute('href')).toBe('/eigen-privacy')
  })
})

describe('AanmeldenForm — dynamic fields', () => {
  it('adds another sibling row on demand', () => {
    render(<AanmeldenForm />)
    fillStep1()
    clickVerder()

    const before = screen.getAllByPlaceholderText('Leeftijd').length
    fireEvent.click(screen.getByRole('button', { name: /verdere broers en zussen/ }))
    expect(screen.getAllByPlaceholderText('Leeftijd').length).toBe(before + 1)
  })

  it('toggles a problematiek checkbox on step 4', async () => {
    render(<AanmeldenForm />)
    fillStep1()
    clickVerder()
    fillStep2()
    clickVerder()
    setInput(/Beschrijf kort en bondig/, 'reden')
    clickVerder()

    const angst = screen.getByRole('checkbox', { name: 'Angst' }) as HTMLInputElement
    expect(angst.checked).toBe(false)
    fireEvent.click(angst)
    expect(angst.checked).toBe(true)
    fireEvent.click(angst)
    expect(angst.checked).toBe(false)
  })
})
