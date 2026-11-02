/**
 * Copy a fetch `HeadersInit` value into a plain header record.
 *
 * Object-spread of an array uses index keys (`0`, `1`, …), so a pair list
 * such as `[['cf-turnstile-response', token]]` would never arrive as a header.
 * A plain object and a `Headers` instance are copied by name.
 */
export function headerRecord(value: unknown): Record<string, string> {
  if (typeof Headers !== 'undefined' && value instanceof Headers) {
    const headers: Record<string, string> = {}
    value.forEach((entry, key) => {
      headers[key] = entry
    })
    return headers
  }
  if (Array.isArray(value)) {
    const headers: Record<string, string> = {}
    for (const item of value) {
      if (!Array.isArray(item) || item.length < 2) continue
      if (typeof item[0] !== 'string' || typeof item[1] !== 'string') continue
      headers[item[0]] = item[1]
    }
    return headers
  }
  if (typeof value === 'object' && value !== null) {
    const headers: Record<string, string> = {}
    for (const [key, entry] of Object.entries(value)) {
      if (typeof entry === 'string') headers[key] = entry
    }
    return headers
  }
  return {}
}
