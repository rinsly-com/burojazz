import type { Page } from '@/payload-types'

import { readSnapshot } from './contentSnapshot'

/**
 * Fetch renderable content from the Payload API over HTTP (no Payload/DB import,
 * so it is safe in a `next export` build).
 *
 * Two modes, switched by BUILD_STATIC:
 * - **Production static build** (`BUILD_STATIC=true`): published pages only.
 * - **Preview** (dev / accp runtime): the latest saved version of every page,
 *   fetched as drafts, regardless of workflow status — so editors always see
 *   their edits. Workflow status only governs the production build, so drafts
 *   are previewable but are never included in the production static build.
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

  if (PRODUCTION_BUILD) {
    return fetchPages('where[_status][equals]=published&limit=200&depth=0')
  }

  // Preview: the latest version of every page (draft or published), so editors
  // see their edits regardless of workflow status.
  return fetchPages('draft=true&limit=200&depth=0')
}

export async function getRenderablePageBySlug(slug: string): Promise<Page | null> {
  const encoded = encodeURIComponent(slug)

  if (PRODUCTION_BUILD) {
    // Static build: prefer the pre-fetched snapshot (see contentSnapshot.ts).
    const snapshot = await readSnapshot<Page | null>(`page-${slug}`)
    if (snapshot) return snapshot
  }

  if (!PRODUCTION_BUILD) {
    // Preview: the latest version of this page (draft or published), regardless
    // of workflow status.
    const preview = await fetchPages(
      `draft=true&where[slug][equals]=${encoded}&limit=1&depth=1`,
    )
    return preview[0] ?? null
  }

  const published = await fetchPages(
    `where[and][0][slug][equals]=${encoded}&where[and][1][_status][equals]=published&limit=1&depth=1`,
  )
  return published[0] ?? null
}
