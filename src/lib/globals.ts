/**
 * Fetch the Header/Footer globals from the Payload API over HTTP (no
 * Payload/DB import, so it is safe in a `next export` build).
 */
import type { Footer, Header } from '@/payload-types'

import { apiOrigin } from './apiOrigin'
import { readSnapshot } from './contentSnapshot'
import { LogCode, logCode } from './logCode'
import { parseFooter, parseHeader } from './rows'

async function fetchNamed<T>(
  slug: 'header' | 'footer',
  parse: (value: unknown) => T | null,
): Promise<T | null> {
  // Static build: prefer the pre-fetched snapshot (see contentSnapshot.ts).
  const snapshot = await readSnapshot<unknown>(`global-${slug}`)
  if (snapshot) return parse(snapshot)
  // Resolve the origin BEFORE the try: apiOrigin() reads headers() on the worker,
  // and that dynamic bailout must propagate (not be swallowed) so the layout
  // rendering the header/footer re-renders per request instead of freezing at build.
  const base = await apiOrigin()
  try {
    const res = await fetch(`${base}/api/globals/${slug}?depth=1`, {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) {
      logCode('warn', LogCode.GLOBAL_FETCH_FAILED, { slug, status: res.status })
      return null
    }
    return parse((await res.json()) as unknown)
  } catch {
    // API may be unreachable (e.g. first static build) — degrade gracefully.
    logCode('warn', LogCode.GLOBAL_FETCH_FAILED, { slug })
    return null
  }
}

export async function getHeader(): Promise<Header | null> {
  return fetchNamed('header', parseHeader)
}

export async function getFooter(): Promise<Footer | null> {
  return fetchNamed('footer', parseFooter)
}
