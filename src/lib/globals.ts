/**
 * Fetch the Header/Footer globals from the Payload API over HTTP (no
 * Payload/DB import, so it is safe in a `next export` build).
 */
import type { Footer, Header } from '@/payload-types'

import { apiOrigin } from './apiOrigin'
import { readSnapshot } from './contentSnapshot'

async function fetchGlobal<T>(slug: string): Promise<T | null> {
  // Static build: prefer the pre-fetched snapshot (see contentSnapshot.ts).
  const snapshot = await readSnapshot<T>(`global-${slug}`)
  if (snapshot) return snapshot
  // Resolve the origin BEFORE the try: apiOrigin() reads headers() on the worker,
  // and that dynamic bailout must propagate (not be swallowed) so the layout
  // rendering the header/footer re-renders per request instead of freezing at build.
  const base = await apiOrigin()
  try {
    const res = await fetch(`${base}/api/globals/${slug}?depth=1`, {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    // API may be unreachable (e.g. first static build) — degrade gracefully.
    return null
  }
}

export async function getHeader(): Promise<Header | null> {
  return fetchGlobal<Header>('header')
}

export async function getFooter(): Promise<Footer | null> {
  return fetchGlobal<Footer>('footer')
}
