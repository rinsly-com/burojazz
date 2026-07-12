import { headers } from 'next/headers'

/**
 * The origin to fetch the Payload API from, for the HTTP-based content helpers
 * (pages.ts, globals.ts) that must stay `next export`-safe.
 *
 * - **Static production export** (`BUILD_STATIC=true`): use the configured
 *   PAYLOAD_API_URL (the accp origin) — there's no request context, and the
 *   snapshot layer usually short-circuits this anyway.
 * - **accp worker / dev runtime**: derive the origin from the incoming request
 *   so the app fetches its OWN API same-origin — no PAYLOAD_API_URL needed, and
 *   content is always live. Reading headers() is deliberately uncaught: the
 *   dynamic-server bailout it raises is what makes the route (and the layout
 *   that renders the header/footer) render on demand instead of being frozen at
 *   build time. The worker has `global_fetch_strictly_public`, so a same-host
 *   self-fetch is allowed.
 */
export async function apiOrigin(): Promise<string> {
  if (process.env.BUILD_STATIC === 'true') {
    return process.env.PAYLOAD_API_URL || 'http://localhost:3000'
  }
  const h = await headers()
  const host = h.get('host')
  if (host) return `${h.get('x-forwarded-proto') ?? 'https'}://${host}`
  return 'http://localhost:3000'
}
