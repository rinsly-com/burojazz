/**
 * Permanent redirect for the old double-dash psycholoog URL.
 *
 * Production is a static Workers Assets site (`wrangler.static.jsonc`,
 * `html_handling: auto-trailing-slash`), so both the slash and no-slash
 * forms are listed in `public/_redirects`. The accp OpenNext worker does
 * not apply that file to requests it serves; `next.config` `redirects()`
 * uses the same paths. Next's own trailing-slash strip is a priority
 * redirect, so the slash form is priority too — otherwise it 308s to the
 * double-dash URL before this 301 runs.
 */

type RedirectRule = {
  source: string
  destination: string
  statusCode: 301
  /** Wins against Next's built-in `/:path+/` → `/:path+` redirect. */
  priority?: true
}

export const PSYCHOLOOG_ORTHOPEDAGOOG_REDIRECTS: readonly RedirectRule[] = [
  {
    source: '/psycholoog--orthopedagoog',
    destination: '/psycholoog-orthopedagoog',
    statusCode: 301,
  },
  {
    source: '/psycholoog--orthopedagoog/',
    destination: '/psycholoog-orthopedagoog',
    statusCode: 301,
    priority: true,
  },
]

/** Lines for `public/_redirects` (Cloudflare Workers Assets). */
export function workersAssetsRedirectLines(): string {
  return (
    PSYCHOLOOG_ORTHOPEDAGOOG_REDIRECTS.map(
      (rule) => `${rule.source} ${rule.destination} ${rule.statusCode}`,
    ).join('\n') + '\n'
  )
}

/** `next.config` `redirects()` entries for the OpenNext accp worker. */
export function nextPermanentRedirects(): RedirectRule[] {
  return PSYCHOLOOG_ORTHOPEDAGOOG_REDIRECTS.map((rule) => ({ ...rule }))
}
