/** Client-side shape + validation for the "Direct aanmelden" wizard. */

export type SiblingRow = { leeftijd: string; type: '' | 'broer' | 'zus' | 'nvt' }

export type AanmeldenData = {
  // Step 1 — Persoonsgegevens
  clientNaam: string
  clientGeboortedatum: string
  clientAdres: string
  verwijzerNaam: string
  verwijzerOrganisatie: string
  verwijzerEmail: string
  verwijzerTelefoon: string
  // Step 2 — Ouders / verzorgers
  moederNaam: string
  moederAdres: string
  moederEmail: string
  moederTelefoon: string
  vaderNaam: string
  vaderAdres: string
  vaderEmail: string
  vaderTelefoon: string
  siblings: SiblingRow[]
  // Step 3 — Reden van aanmelden
  redenAanmelden: string
  hulpverleningsgeschiedenis: string
  // Step 4 — Hulpvraag
  problematiek: string[]
  problematiekOverig: string
  dsmDiagnoseBekend: '' | 'ja' | 'nee'
  vormVanHulp: string[]
  privacyAkkoord: boolean
}

export const EMPTY_AANMELDING: AanmeldenData = {
  clientNaam: '',
  clientGeboortedatum: '',
  clientAdres: '',
  verwijzerNaam: '',
  verwijzerOrganisatie: '',
  verwijzerEmail: '',
  verwijzerTelefoon: '',
  moederNaam: '',
  moederAdres: '',
  moederEmail: '',
  moederTelefoon: '',
  vaderNaam: '',
  vaderAdres: '',
  vaderEmail: '',
  vaderTelefoon: '',
  siblings: [{ leeftijd: '', type: '' }],
  redenAanmelden: '',
  hulpverleningsgeschiedenis: '',
  problematiek: [],
  problematiekOverig: '',
  dsmDiagnoseBekend: '',
  vormVanHulp: [],
  privacyAkkoord: false,
}

export const STEPS = [
  { key: 'persoonsgegevens', label: 'Persoonsgegevens' },
  { key: 'ouders', label: 'Ouders / verzorgers' },
  { key: 'reden', label: 'Reden van aanmelden' },
  { key: 'hulpvraag', label: 'Hulpvraag' },
] as const

export type Errors = Partial<Record<keyof AanmeldenData, string>>

const REQUIRED = 'Dit veld is verplicht'
const isBlank = (v: string) => v.trim() === ''
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

/** Fields required per step (matching the asterisks in the design). */
const REQUIRED_BY_STEP: Record<number, (keyof AanmeldenData)[]> = {
  0: [
    'clientNaam',
    'clientGeboortedatum',
    'clientAdres',
    'verwijzerNaam',
    'verwijzerOrganisatie',
    'verwijzerEmail',
    'verwijzerTelefoon',
  ],
  1: ['moederNaam', 'moederAdres', 'moederEmail', 'moederTelefoon', 'vaderNaam'],
  2: ['redenAanmelden'],
  3: [],
}

const EMAIL_FIELDS: (keyof AanmeldenData)[] = [
  'verwijzerEmail',
  'moederEmail',
  'vaderEmail',
]

/** Validate one step; returns a map of field → message (empty = valid). */
export function validateStep(step: number, data: AanmeldenData): Errors {
  const errors: Errors = {}

  for (const field of REQUIRED_BY_STEP[step] ?? []) {
    if (isBlank(String(data[field] ?? ''))) errors[field] = REQUIRED
  }

  // Email format (only when a value is present).
  for (const field of EMAIL_FIELDS) {
    const value = String(data[field] ?? '')
    if (!isBlank(value) && !isEmail(value)) errors[field] = 'Ongeldig e-mailadres'
  }

  if (step === 3 && !data.privacyAkkoord) {
    errors.privacyAkkoord = 'U dient akkoord te gaan met de privacyverklaring'
  }

  return errors
}

/** Serialise the wizard state into the POST body for /api/aanmeldingen/submit. */
export function toSubmitBody(data: AanmeldenData): Record<string, unknown> {
  return {
    ...data,
    // Drop empty sibling rows.
    siblings: data.siblings.filter((s) => s.leeftijd.trim() !== '' || s.type !== ''),
  }
}
