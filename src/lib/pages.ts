import type { Page } from '@/payload-types'

import { readSnapshot } from './contentSnapshot'

/**
 * Fetch renderable content from the Payload API over HTTP (no Payload/DB import,
 * so it is safe in a `next export` build).
 *
 * Two modes, switched by BUILD_STATIC:
 * - **Production static build** (`BUILD_STATIC=true`): published pages only.
 * - **Preview** (dev / accp runtime): published pages PLUS pages approved for
 *   release (workflowStatus = "ready"), fetched as drafts, so reviewers can see
 *   approved content rendered before it is published. Ready pages are therefore
 *   previewable but are never included in the production static build.
 *
 * Configure the API origin with PAYLOAD_API_URL (defaults to local dev).
 */
const API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3000'
const PRODUCTION_BUILD = process.env.BUILD_STATIC === 'true'

async function fetchPages(query: string): Promise<Page[]> {
  try {
    const res = await fetch(`${API_URL}/api/pages?${query}`, {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) return []
    const data = (await res.json()) as { docs?: Page[] }
    return data.docs ?? []
  } catch {
    // API may be unreachable (e.g. first static build) — degrade gracefully.
    return []
  }
}

export async function getRenderablePages(): Promise<Page[]> {
  if (PRODUCTION_BUILD) {
    // Static build: prefer the pre-fetched snapshot (see contentSnapshot.ts).
    const snapshot = await readSnapshot<Page[]>('pages-index')
    if (snapshot) return snapshot
  }

  const published = await fetchPages('where[_status][equals]=published&limit=200&depth=0')
  if (PRODUCTION_BUILD) return published

  // Preview: overlay Ready drafts on top of the published set (a Ready page
  // shows its approved draft even if an older published version exists).
  const ready = await fetchPages('draft=true&where[workflowStatus][equals]=ready&limit=200&depth=0')
  const byId = new Map<Page['id'], Page>()
  for (const page of published) byId.set(page.id, page)
  for (const page of ready) byId.set(page.id, page)
  return [...byId.values()]
}

export async function getRenderablePageBySlug(slug: string): Promise<Page | null> {
  const encoded = encodeURIComponent(slug)

  if (PRODUCTION_BUILD) {
    // Static build: prefer the pre-fetched snapshot (see contentSnapshot.ts).
    const snapshot = await readSnapshot<Page | null>(`page-${slug}`)
    if (snapshot) return snapshot
  }

  if (!PRODUCTION_BUILD) {
    // Preview: prefer an approved (Ready) draft if one exists.
    const ready = await fetchPages(
      `draft=true&where[and][0][slug][equals]=${encoded}&where[and][1][workflowStatus][equals]=ready&limit=1&depth=1`,
    )
    if (ready[0]) return ready[0]
  }

  const published = await fetchPages(
    `where[and][0][slug][equals]=${encoded}&where[and][1][_status][equals]=published&limit=1&depth=1`,
  )
  return published[0] ?? null
}
