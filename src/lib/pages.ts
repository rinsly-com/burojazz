import type { Page } from '@/payload-types'

import { apiOrigin } from './apiOrigin'
import { readSnapshot } from './contentSnapshot'

/**
 * Fetch renderable content from the Payload API over HTTP (no Payload/DB import,
 * so it is safe in a `next export` build). The API origin (and static-vs-runtime
 * behaviour) is resolved by apiOrigin().
 *
 * Two modes, switched by BUILD_STATIC:
 * - **Production static build** (`BUILD_STATIC=true`): published pages only.
 * - **Preview** (dev / accp runtime): the latest saved version of every page,
 *   fetched as drafts, regardless of workflow status — so editors always see
 *   their edits. Workflow status only governs the production build, so drafts
 *   are previewable but are never included in the production static build.
 */
const PRODUCTION_BUILD = process.env.BUILD_STATIC === 'true'

/**
 * `draft=true` reads Payload's versions table, so it silently omits any page that
 * has no version rows yet (e.g. one seeded or migrated before drafts existed).
 * Such a page then 404s in preview while it is live on production — the inverse
 * of what preview is for. Both preview helpers therefore fall back to the plain
 * (published) row, which is what these two helpers do.
 */
const mergeBySlug = (preferred: Page[], fallback: Page[]): Page[] => {
  const bySlug = new Map<string, Page>()
  for (const page of fallback) bySlug.set(page.slug, page)
  for (const page of preferred) bySlug.set(page.slug, page)
  return [...bySlug.values()]
}

async function fetchPages(query: string): Promise<Page[]> {
  // Resolve the origin BEFORE the try: apiOrigin() reads headers() on the worker,
  // and the dynamic-server bailout that triggers must propagate (not be swallowed
  // by the catch below) for Next to render this route dynamically.
  const base = await apiOrigin()
  try {
    const res = await fetch(`${base}/api/pages?${query}`, {
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
  // see their edits regardless of workflow status. Pages with no version rows
  // come from the plain list (see mergeBySlug).
  const [drafts, live] = await Promise.all([
    fetchPages('draft=true&limit=200&depth=0'),
    fetchPages('limit=200&depth=0'),
  ])
  return mergeBySlug(drafts, live)
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
    if (preview[0]) return preview[0]
    // No version rows for this page — fall back to its live row so a published
    // page is never a 404 in preview (see mergeBySlug).
    const live = await fetchPages(`where[slug][equals]=${encoded}&limit=1&depth=1`)
    return live[0] ?? null
  }

  const published = await fetchPages(
    `where[and][0][slug][equals]=${encoded}&where[and][1][_status][equals]=published&limit=1&depth=1`,
  )
  return published[0] ?? null
}
