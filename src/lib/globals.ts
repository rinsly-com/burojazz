/**
 * Fetch the Header/Footer globals from the Payload API over HTTP (no
 * Payload/DB import, so it is safe in a `next export` build).
 */
import type { Footer, Header } from '@/payload-types'

import { readSnapshot } from './contentSnapshot'

const API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3000'

async function fetchGlobal<T>(slug: string): Promise<T | null> {
  // Static build: prefer the pre-fetched snapshot (see contentSnapshot.ts).
  const snapshot = await readSnapshot<T>(`global-${slug}`)
  if (snapshot) return snapshot
  try {
    const res = await fetch(`${API_URL}/api/globals/${slug}?depth=1`, {
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
