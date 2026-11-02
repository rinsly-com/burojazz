/**
 * POST /api/aanmeldingen/submit body parser.
 *
 * A non-object JSON body used to throw on `body.website` before the handler's
 * try/catch, so the route 500'd instead of returning 400. The parser also
 * keeps the previous whitelist: honeypot short-circuit, empty DSM omitted,
 * `status` cannot be set by the public form.
 */
import { describe, expect, it } from 'vitest'

import { parseAanmeldingSubmit } from '@/lib/aanmeldingSubmit'
import { toSubmitBody, type AanmeldenData } from '@/components/frontend/aanmelden/formData'

const valid = (): AanmeldenData => ({
  clientNaam: 'Jip de Vries',
  clientGeboortedatum: '2012-05-04',
  clientAdres: 'Dorpsstraat 1, Utrecht',
  verwijzerNaam: 'Mw. Jansen',
  verwijzerOrganisatie: 'Wijkteam Noord',
  verwijzerEmail: 'jansen@wijkteam.nl',
  verwijzerTelefoon: '0612345678',
  moederNaam: 'A. de Vries',
  moederAdres: 'Dorpsstraat 1, Utrecht',
  moederEmail: 'moeder@example.nl',
  moederTelefoon: '0612345678',
  vaderNaam: 'B. de Vries',
  vaderAdres: '',
  vaderEmail: '',
  vaderTelefoon: '',
  siblings: [{ leeftijd: '', type: '' }],
  redenAanmelden: 'Ondersteuning bij emotieregulatie.',
  hulpverleningsgeschiedenis: '',
  problematiek: [],
  problematiekOverig: '',
  dsmDiagnoseBekend: '',
  vormVanHulp: [],
  privacyAkkoord: true,
})

describe('parseAanmeldingSubmit', () => {
  it('rejects a non-object body instead of throwing', () => {
    // REGRESSION: `null` JSON crashed the submit route with a TypeError.
    expect(() => parseAanmeldingSubmit(null)).not.toThrow()
    expect(parseAanmeldingSubmit(null)).toEqual({ kind: 'invalid' })
    expect(parseAanmeldingSubmit([])).toEqual({ kind: 'invalid' })
    expect(parseAanmeldingSubmit('nope')).toEqual({ kind: 'invalid' })
  })

  it('accepts the wizard body and omits an empty DSM select', () => {
    const decision = parseAanmeldingSubmit(toSubmitBody(valid()))
    expect(decision.kind).toBe('data')
    if (decision.kind !== 'data') return
    expect(decision.data).toMatchObject({
      clientNaam: 'Jip de Vries',
      verwijzerEmail: 'jansen@wijkteam.nl',
      vaderEmail: '',
      privacyAkkoord: true,
      siblings: [],
      problematiek: [],
    })
    expect(decision.data).not.toHaveProperty('dsmDiagnoseBekend')
    expect(decision.data).not.toHaveProperty('status')
  })

  it('does not let the public body set status', () => {
    const decision = parseAanmeldingSubmit({ ...toSubmitBody(valid()), status: 'afgehandeld' })
    expect(decision.kind).toBe('data')
    if (decision.kind !== 'data') return
    expect(decision.data.status).toBeUndefined()
  })

  it('pretends a filled honeypot succeeded', () => {
    const decision = parseAanmeldingSubmit({ ...toSubmitBody(valid()), website: 'https://spam.test' })
    expect(decision).toEqual({ kind: 'honeypot' })
  })

  it('rejects a sibling relation that is not one of the options', () => {
    const body = toSubmitBody({
      ...valid(),
      siblings: [{ leeftijd: '4', type: 'neef' as 'broer' }],
    })
    expect(parseAanmeldingSubmit(body)).toEqual({ kind: 'invalid' })
  })

  it('keeps a real sibling row and drops an empty one', () => {
    const body = toSubmitBody({
      ...valid(),
      siblings: [
        { leeftijd: '', type: '' },
        { leeftijd: '8', type: 'zus' },
      ],
    })
    const decision = parseAanmeldingSubmit(body)
    expect(decision.kind).toBe('data')
    if (decision.kind !== 'data') return
    expect(decision.data.siblings).toEqual([{ leeftijd: '8', type: 'zus' }])
  })
})
