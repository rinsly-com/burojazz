/**
 * Fetch published content from the Payload (accp) REST API over HTTP.
 *
 * Used by the public frontend both at runtime (on accp) and at build time when
 * generating the fully static production site. No Payload/DB import here, so it
 * is safe to include in a `next export` build. Unauthenticated reads only ever
 * return published documents (see Pages access control).
 *
 * Configure the API origin with PAYLOAD_API_URL (defaults to local dev).
 */
const API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3000'

export type PageDoc = {
  id: string
  title: string
  slug: string
  content?: unknown
}

export async function getPublishedPages(): Promise<PageDoc[]> {
  try {
    const res = await fetch(
      `${API_URL}/api/pages?where[_status][equals]=published&limit=200&depth=0`,
      { headers: { accept: 'application/json' } },
    )
    if (!res.ok) return []
    const data = (await res.json()) as { docs?: PageDoc[] }
    return data.docs ?? []
  } catch {
    // accp may not be deployed/reachable yet (e.g. first static build). Degrade
    // gracefully to an empty site rather than failing the build.
    return []
  }
}

export async function getPublishedPageBySlug(slug: string): Promise<PageDoc | null> {
  try {
    const res = await fetch(
      `${API_URL}/api/pages?where[and][0][slug][equals]=${encodeURIComponent(
        slug,
      )}&where[and][1][_status][equals]=published&limit=1&depth=0`,
      { headers: { accept: 'application/json' } },
    )
    if (!res.ok) return null
    const data = (await res.json()) as { docs?: PageDoc[] }
    return data.docs?.[0] ?? null
  } catch {
    return null
  }
}
