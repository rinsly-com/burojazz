import { z } from 'zod'

import {
  DSM_OPTIONS,
  PROBLEMATIEK_OPTIONS,
  SIBLING_TYPE_OPTIONS,
  VORM_VAN_HULP_OPTIONS,
} from './aanmeldingOptions'

/**
 * Public POST /api/aanmeldingen/submit body. Same accepted shape as the
 * previous whitelist (empty optional select omitted, empty sibling `type`
 * omitted, honeypot short-circuit). A non-object body is invalid instead of
 * throwing. Field values are not returned or logged.
 */

const text = z.string()
const requiredText = z.string().min(1)

function enumOf(options: { value: string }[]) {
  const values = options.map((option) => option.value)
  return z.enum(values as [string, ...string[]])
}

const siblingType = enumOf(SIBLING_TYPE_OPTIONS)
const dsm = enumOf(DSM_OPTIONS)
const problematiek = enumOf(PROBLEMATIEK_OPTIONS)
const vormVanHulp = enumOf(VORM_VAN_HULP_OPTIONS)

const submitSchema = z.object({
  clientNaam: requiredText,
  clientGeboortedatum: requiredText,
  clientAdres: requiredText,
  verwijzerNaam: requiredText,
  verwijzerOrganisatie: requiredText,
  verwijzerEmail: z.email(),
  verwijzerTelefoon: requiredText,
  moederNaam: requiredText,
  moederAdres: requiredText,
  moederEmail: z.email(),
  moederTelefoon: requiredText,
  vaderNaam: requiredText,
  vaderAdres: text.optional(),
  vaderEmail: z.union([z.literal(''), z.email()]).optional(),
  vaderTelefoon: text.optional(),
  siblings: z.array(z.unknown()).optional(),
  redenAanmelden: requiredText,
  hulpverleningsgeschiedenis: text.optional(),
  problematiek: z.array(problematiek).optional(),
  problematiekOverig: text.optional(),
  dsmDiagnoseBekend: z.union([z.literal(''), dsm]).optional(),
  vormVanHulp: z.array(vormVanHulp).optional(),
  privacyAkkoord: z.boolean(),
})

export type SubmitDecision =
  | { kind: 'honeypot' }
  | { kind: 'invalid' }
  | { kind: 'data'; data: Record<string, unknown> }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** null = a sibling field has a type Payload would reject. Non-objects are dropped. */
function siblingsOf(raw: unknown[]): Record<string, unknown>[] | null {
  const rows: Record<string, unknown>[] = []
  for (const item of raw) {
    if (!isRecord(item)) continue
    if (item.leeftijd != null && typeof item.leeftijd !== 'string') return null
    if (item.type != null && item.type !== '') {
      if (typeof item.type !== 'string' || !siblingType.safeParse(item.type).success) return null
    }
    const row: Record<string, unknown> = {
      leeftijd: typeof item.leeftijd === 'string' ? item.leeftijd : '',
    }
    if (typeof item.type === 'string' && item.type !== '') row.type = item.type
    rows.push(row)
  }
  return rows
}

export function parseAanmeldingSubmit(body: unknown): SubmitDecision {
  if (!isRecord(body)) return { kind: 'invalid' }
  if (typeof body.website === 'string' && body.website.trim() !== '') return { kind: 'honeypot' }

  const parsed = submitSchema.safeParse(body)
  if (!parsed.success) return { kind: 'invalid' }

  const src = parsed.data
  const data: Record<string, unknown> = {
    clientNaam: src.clientNaam,
    clientGeboortedatum: src.clientGeboortedatum,
    clientAdres: src.clientAdres,
    verwijzerNaam: src.verwijzerNaam,
    verwijzerOrganisatie: src.verwijzerOrganisatie,
    verwijzerEmail: src.verwijzerEmail,
    verwijzerTelefoon: src.verwijzerTelefoon,
    moederNaam: src.moederNaam,
    moederAdres: src.moederAdres,
    moederEmail: src.moederEmail,
    moederTelefoon: src.moederTelefoon,
    vaderNaam: src.vaderNaam,
    redenAanmelden: src.redenAanmelden,
    privacyAkkoord: src.privacyAkkoord,
  }
  if (src.vaderAdres !== undefined) data.vaderAdres = src.vaderAdres
  if (src.vaderEmail !== undefined) data.vaderEmail = src.vaderEmail
  if (src.vaderTelefoon !== undefined) data.vaderTelefoon = src.vaderTelefoon
  if (src.hulpverleningsgeschiedenis !== undefined) {
    data.hulpverleningsgeschiedenis = src.hulpverleningsgeschiedenis
  }
  if (src.problematiek !== undefined) data.problematiek = src.problematiek
  if (src.problematiekOverig !== undefined) data.problematiekOverig = src.problematiekOverig
  if (src.dsmDiagnoseBekend) data.dsmDiagnoseBekend = src.dsmDiagnoseBekend
  if (src.vormVanHulp !== undefined) data.vormVanHulp = src.vormVanHulp
  if (src.siblings !== undefined) {
    const siblings = siblingsOf(src.siblings)
    if (siblings === null) return { kind: 'invalid' }
    data.siblings = siblings
  }
  return { kind: 'data', data }
}
