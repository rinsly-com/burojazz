/**
 * Permanent redirect for the old double-dash psycholoog URL.
 *
 * Production is a static Workers Assets site (`wrangler.static.jsonc`,
 * `html_handling: auto-trailing-slash`), so both the slash and no-slash
 * forms are listed in `public/_redirects`. The accp OpenNext worker does
 * not apply that file. `next.config` `redirects()` lists only the no-slash
 * path: with `trailingSlash: false`, Next 308s
 * `/psycholoog--orthopedagoog/` to `/psycholoog--orthopedagoog`, and this
 * 301 then sends that to `/psycholoog-orthopedagoog`. `priority` is not a
 * valid user-redirect field in Next 16.4.3 — `next build` rejects it.
 */

type RedirectRule = {
  source: string
  destination: string
  statusCode: 301
}

const DESTINATION = '/psycholoog-orthopedagoog'
const SOURCE = '/psycholoog--orthopedagoog'

/** Both forms, for `public/_redirects` (Cloudflare Workers Assets). */
export const WORKERS_ASSETS_REDIRECTS: readonly RedirectRule[] = [
  { source: SOURCE, destination: DESTINATION, statusCode: 301 },
  { source: `${SOURCE}/`, destination: DESTINATION, statusCode: 301 },
]

/** Lines for `public/_redirects`. */
export function workersAssetsRedirectLines(): string {
  return (
    WORKERS_ASSETS_REDIRECTS.map(
      (rule) => `${rule.source} ${rule.destination} ${rule.statusCode}`,
    ).join('\n') + '\n'
  )
}

/**
 * `next.config` `redirects()` for the OpenNext accp worker.
 * No trailing-slash source and no `priority` — Next rejects that field.
 */
export function nextPermanentRedirects(): RedirectRule[] {
  return [{ source: SOURCE, destination: DESTINATION, statusCode: 301 }]
}
