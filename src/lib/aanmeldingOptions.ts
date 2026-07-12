/**
 * Shared option lists for the "Direct aanmelden" intake form.
 *
 * One source of truth consumed by three places so their `value`s never drift:
 *  - the `Aanmeldingen` collection (select field options)
 *  - the notification email builder (value → human label)
 *  - the frontend wizard (checkbox groups)
 */

export type Option = { value: string; label: string }

/** Step 4 — "Hulpvraag": what the client is struggling with. */
export const PROBLEMATIEK_OPTIONS: Option[] = [
  { value: 'adhd', label: 'AD(H)D' },
  { value: 'ass', label: 'Autisme Spectrum Stoornis (ASS)' },
  { value: 'verstandelijke-beperking', label: 'Verstandelijke beperking' },
  { value: 'hoogbegaafdheid', label: 'Hoogbegaafdheid' },
  { value: 'emoties', label: 'Problemen met het uiten van emoties' },
  { value: 'lichamelijke-klachten', label: 'Lichamelijke klachten' },
  { value: 'somberheid', label: 'Somberheid' },
  { value: 'angst', label: 'Angst' },
  { value: 'trauma', label: 'Traumagerelateerde klachten' },
  { value: 'drugsgebruik', label: 'Drugsgebruik' },
  { value: 'negatief-zelfbeeld', label: 'Negatief zelfbeeld' },
  {
    value: 'vastlopen',
    label: 'Vastlopen op verschillende leefgebieden (school en/of werk, vriendschappen etc)',
  },
]

/** Step 4 — "Welke vorm van hulp is gewenst?". */
export const VORM_VAN_HULP_OPTIONS: Option[] = [
  { value: 'begeleiding', label: 'Begeleiding' },
  { value: 'pmt', label: 'PMT (Pychomotorische Therapie)' },
  { value: 'basis-ggz', label: 'Behandeling vanuit de basis-GGZ' },
  { value: 'ash', label: 'ASH (Ambulante Spoedhulp)' },
  { value: 'wmo', label: 'WMO (hulp vanuit de Wet Maatschappelijke Ondersteuning)' },
  { value: 'begeleiding-op-school', label: 'Begeleiding op school' },
  { value: 'diagnostiek', label: 'Diagnostiek' },
]

/** Step 2 — sibling row: relation to the client. */
export const SIBLING_TYPE_OPTIONS: Option[] = [
  { value: 'broer', label: 'Broer(tje)' },
  { value: 'zus', label: 'Zus(je)' },
  { value: 'nvt', label: 'n.v.t.' },
]

/** Step 4 — DSM diagnosis known? */
export const DSM_OPTIONS: Option[] = [
  { value: 'ja', label: 'Ja' },
  { value: 'nee', label: 'Nee' },
]

/** Resolve a stored `value` to its human label (falls back to the raw value). */
export function labelFor(options: Option[], value: string | null | undefined): string {
  if (!value) return ''
  return options.find((o) => o.value === value)?.label ?? value
}
