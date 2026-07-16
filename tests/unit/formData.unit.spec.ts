// @vitest-environment node
import { describe, expect, it } from 'vitest'

import {
  EMPTY_AANMELDING,
  STEPS,
  toSubmitBody,
  validateStep,
  type AanmeldenData,
} from '@/components/frontend/aanmelden/formData'

/** A fully valid dataset; individual tests blank/override the fields they probe. */
function validData(overrides: Partial<AanmeldenData> = {}): AanmeldenData {
  return {
    ...EMPTY_AANMELDING,
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
    redenAanmelden: 'Ondersteuning bij emotieregulatie.',
    privacyAkkoord: true,
    ...overrides,
  }
}

const REQUIRED = 'Dit veld is verplicht'
const BAD_EMAIL = 'Ongeldig e-mailadres'

describe('EMPTY_AANMELDING', () => {
  it('starts blank with one empty sibling row and no consent', () => {
    expect(EMPTY_AANMELDING.clientNaam).toBe('')
    expect(EMPTY_AANMELDING.privacyAkkoord).toBe(false)
    expect(EMPTY_AANMELDING.problematiek).toEqual([])
    expect(EMPTY_AANMELDING.vormVanHulp).toEqual([])
    expect(EMPTY_AANMELDING.siblings).toEqual([{ leeftijd: '', type: '' }])
    expect(EMPTY_AANMELDING.dsmDiagnoseBekend).toBe('')
  })
})

describe('STEPS', () => {
  it('defines the four wizard steps in order', () => {
    expect(STEPS.map((s) => s.key)).toEqual(['persoonsgegevens', 'ouders', 'reden', 'hulpvraag'])
    expect(STEPS).toHaveLength(4)
  })
})

describe('validateStep — step 0 (Persoonsgegevens)', () => {
  const required: (keyof AanmeldenData)[] = [
    'clientNaam',
    'clientGeboortedatum',
    'clientAdres',
    'verwijzerNaam',
    'verwijzerOrganisatie',
    'verwijzerEmail',
    'verwijzerTelefoon',
  ]

  it('passes when every required field is filled', () => {
    expect(validateStep(0, validData())).toEqual({})
  })

  it('flags every required field when the form is empty', () => {
    const errors = validateStep(0, EMPTY_AANMELDING)
    for (const field of required) expect(errors[field]).toBe(REQUIRED)
  })

  it.each(required)('flags %s when it alone is blank', (field) => {
    const errors = validateStep(0, validData({ [field]: '' } as Partial<AanmeldenData>))
    expect(errors[field]).toBe(REQUIRED)
  })

  it('treats whitespace-only values as blank', () => {
    const errors = validateStep(0, validData({ clientNaam: '   ' }))
    expect(errors.clientNaam).toBe(REQUIRED)
  })

  it('does not flag step-1/2 fields on step 0', () => {
    const errors = validateStep(0, validData({ moederNaam: '', redenAanmelden: '' }))
    expect(errors.moederNaam).toBeUndefined()
    expect(errors.redenAanmelden).toBeUndefined()
  })
})

describe('validateStep — step 1 (Ouders / verzorgers)', () => {
  const required: (keyof AanmeldenData)[] = [
    'moederNaam',
    'moederAdres',
    'moederEmail',
    'moederTelefoon',
    'vaderNaam',
  ]

  it('passes when the required parent fields are filled', () => {
    expect(validateStep(1, validData())).toEqual({})
  })

  it.each(required)('flags %s when it alone is blank', (field) => {
    const errors = validateStep(1, validData({ [field]: '' } as Partial<AanmeldenData>))
    expect(errors[field]).toBe(REQUIRED)
  })

  it('does not require the father contact fields beyond his name', () => {
    const errors = validateStep(1, validData({ vaderAdres: '', vaderEmail: '', vaderTelefoon: '' }))
    expect(errors).toEqual({})
  })
})

describe('validateStep — step 2 (Reden van aanmelden)', () => {
  it('requires only redenAanmelden', () => {
    expect(validateStep(2, validData({ redenAanmelden: '' })).redenAanmelden).toBe(REQUIRED)
    expect(validateStep(2, validData())).toEqual({})
  })

  it('does not require hulpverleningsgeschiedenis', () => {
    expect(validateStep(2, validData({ hulpverleningsgeschiedenis: '' }))).toEqual({})
  })
})

describe('validateStep — step 3 (Hulpvraag) privacy consent', () => {
  it('requires the privacy checkbox', () => {
    const errors = validateStep(3, validData({ privacyAkkoord: false }))
    expect(errors.privacyAkkoord).toBe('U dient akkoord te gaan met de privacyverklaring')
  })

  it('passes once consent is given', () => {
    expect(validateStep(3, validData({ privacyAkkoord: true }))).toEqual({})
  })

  it('does not require problematiek / vormVanHulp selections', () => {
    const errors = validateStep(3, validData({ problematiek: [], vormVanHulp: [] }))
    expect(errors).toEqual({})
  })
})

describe('validateStep — email format (all steps)', () => {
  it.each([
    'plainaddress',
    'missing@dot',
    '@no-local.nl',
    'spaces in@email.nl',
    'trailing@dot.',
    'two@@at.nl',
  ])('rejects the invalid address %s', (bad) => {
    expect(validateStep(0, validData({ verwijzerEmail: bad })).verwijzerEmail).toBe(BAD_EMAIL)
  })

  it.each(['a@b.nl', 'jansen@wijkteam.nl', 'first.last+tag@sub.example.co.uk'])(
    'accepts the valid address %s',
    (ok) => {
      expect(validateStep(0, validData({ verwijzerEmail: ok })).verwijzerEmail).toBeUndefined()
    },
  )

  it('validates moeder and vader email fields, on any step', () => {
    // moederEmail is checked even outside its own step (step 0 here).
    expect(validateStep(0, validData({ moederEmail: 'nope' })).moederEmail).toBe(BAD_EMAIL)
    // vaderEmail is optional but format-checked when present.
    expect(validateStep(1, validData({ vaderEmail: 'nope' })).vaderEmail).toBe(BAD_EMAIL)
    expect(validateStep(1, validData({ vaderEmail: '' })).vaderEmail).toBeUndefined()
  })

  it('trims before checking the email format', () => {
    expect(validateStep(0, validData({ verwijzerEmail: '  jansen@wijkteam.nl  ' })).verwijzerEmail).toBeUndefined()
  })

  it('reports both a required error AND a format error independently', () => {
    // verwijzerEmail blank => required (blank short-circuits format since format
    // only runs on non-blank), while moederEmail has a bad format.
    const errors = validateStep(0, validData({ verwijzerEmail: '', moederEmail: 'bad' }))
    expect(errors.verwijzerEmail).toBe(REQUIRED)
    expect(errors.moederEmail).toBe(BAD_EMAIL)
  })
})

describe('validateStep — unknown step index', () => {
  it('still runs the cross-step email checks but no required checks', () => {
    expect(validateStep(99, EMPTY_AANMELDING)).toEqual({})
    expect(validateStep(99, validData({ verwijzerEmail: 'bad' })).verwijzerEmail).toBe(BAD_EMAIL)
  })
})

describe('toSubmitBody', () => {
  it('drops fully-empty sibling rows', () => {
    const body = toSubmitBody(validData({ siblings: [{ leeftijd: '', type: '' }] }))
    expect(body.siblings).toEqual([])
  })

  it('keeps a sibling row with only an age', () => {
    const body = toSubmitBody(validData({ siblings: [{ leeftijd: '8', type: '' }] }))
    expect(body.siblings).toEqual([{ leeftijd: '8', type: '' }])
  })

  it('keeps a sibling row with only a type', () => {
    const body = toSubmitBody(validData({ siblings: [{ leeftijd: '', type: 'zus' }] }))
    expect(body.siblings).toEqual([{ leeftijd: '', type: 'zus' }])
  })

  it('treats a whitespace-only age as filled (only trims for the blank check)', () => {
    const body = toSubmitBody(validData({ siblings: [{ leeftijd: '  ', type: '' }] }))
    expect(body.siblings).toEqual([])
  })

  it('keeps populated rows and drops empty ones in a mixed list', () => {
    const body = toSubmitBody(
      validData({
        siblings: [
          { leeftijd: '10', type: 'broer' },
          { leeftijd: '', type: '' },
          { leeftijd: '', type: 'nvt' },
        ],
      }),
    )
    expect(body.siblings).toEqual([
      { leeftijd: '10', type: 'broer' },
      { leeftijd: '', type: 'nvt' },
    ])
  })

  it('passes through the rest of the data unchanged', () => {
    const data = validData({ problematiek: ['angst', 'trauma'], dsmDiagnoseBekend: 'ja' })
    const body = toSubmitBody(data)
    expect(body.clientNaam).toBe('Jip de Vries')
    expect(body.problematiek).toEqual(['angst', 'trauma'])
    expect(body.dsmDiagnoseBekend).toBe('ja')
    expect(body.privacyAkkoord).toBe(true)
  })

  it('does not mutate the original data object', () => {
    const data = validData({ siblings: [{ leeftijd: '', type: '' }] })
    toSubmitBody(data)
    expect(data.siblings).toEqual([{ leeftijd: '', type: '' }])
  })
})
