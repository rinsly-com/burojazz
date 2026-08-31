/**
 * Preview-mode gate for this site's owned routes.
 *
 * The engine's `resolvePreview` lives behind `createHomeRoute` /
 * `createSlugRoute` and is not on the package export map. This site cannot
 * adopt those factories (unlocalized paths, HTTP page fetch, owned workflow
 * Pages), so the same contract is inlined here. Keep behaviour aligned with
 * `@rinsly-com/site-core` `lib/preview.ts`: `?preview=1` alone grants nothing;
 * an authenticated editor session is required; static export never previews.
 */
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'

import type { SanitizedConfig } from 'payload'

export type SearchParams = Promise<Record<string, string | string[] | undefined>>

export type PreviewState = {
  isPreview: boolean
  serverURL: string
}

const NOT_PREVIEWING: PreviewState = { isPreview: false, serverURL: '' }

function asked(value: string | string[] | undefined): boolean {
  const first = Array.isArray(value) ? value[0] : value
  return first === '1' || first === 'true'
}

export async function resolvePreview({
  config,
  searchParams,
}: {
  config: Promise<SanitizedConfig> | SanitizedConfig
  searchParams?: SearchParams
}): Promise<PreviewState> {
  // Must stay first: reading searchParams/headers during BUILD_STATIC would
  // mark every route dynamic and break `output: 'export'`.
  if (process.env.BUILD_STATIC === 'true' || !searchParams) return NOT_PREVIEWING

  const params = await searchParams
  if (!asked(params.preview)) return NOT_PREVIEWING

  try {
    const incoming = await nextHeaders()
    const host = incoming.get('host') ?? ''
    const proto =
      incoming.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
    const serverURL = `${proto}://${host}`

    // CSRF checks Origin before cookie auth; iframe navigations send none.
    // Mirror the engine: set Origin to this request's own host.
    const headers = new Headers(incoming)
    headers.set('origin', serverURL)

    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers })
    if (!user) return NOT_PREVIEWING

    return { isPreview: true, serverURL }
  } catch {
    return NOT_PREVIEWING
  }
}

/** Unlocalized draft/preview URL (`localization: false`). */
export function previewPath(slug?: string | null): string {
  const clean = slug?.replace(/^\/+/, '') ?? ''
  const base = !clean || clean === 'home' ? '/' : `/${clean}`
  return `${base}?preview=1`
}
