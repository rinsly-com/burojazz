/**
 * Canonical public site origin — the single source of truth for metadataBase,
 * canonical URLs, absolute OG image URLs, the sitemap and robots.
 *
 * Production is the static export served at burojazz.com. burojazz.nl serves the
 * same content and is canonicalised here via the `<link rel="canonical">` tags
 * every page emits, so Google treats .com as the primary and .nl as a duplicate
 * (no ranking split). Override per environment with NEXT_PUBLIC_SITE_URL — it is
 * inlined at build time, so it must be set when running `build:static`.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://burojazz.com').replace(
  /\/+$/,
  '',
)

export const SITE_NAME = 'Buro J.A.Z.Z.'

/** Build an absolute URL on the canonical origin from a root-relative path. */
export function absoluteUrl(pathname = '/'): string {
  return new URL(pathname, `${SITE_URL}/`).toString()
}
