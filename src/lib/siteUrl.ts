/**
 * Canonical public site origin — the single source of truth for metadataBase,
 * canonical URLs, absolute OG image URLs, the sitemap and robots.
 *
 * Production is the static export served at burojazz.nl. burojazz.com and
 * www.burojazz.nl both 301 there, so .nl is the only origin that answers 200
 * and is therefore the canonical one.
 *
 * This used to say the opposite and point at .com, which meant every page
 * emitted `<link rel="canonical">` at a URL that redirects away. A canonical
 * should be self-referencing; naming a redirecting host asks search engines to
 * index an address the site never serves from. Verified before changing:
 * burojazz.com and www.burojazz.nl answer 301 to https://burojazz.nl/, which
 * answers 200.
 *
 * Override per environment with NEXT_PUBLIC_SITE_URL — it is inlined at build
 * time, so it must be set when running `build:static`.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://burojazz.nl').replace(
  /\/+$/,
  '',
)

export const SITE_NAME = 'Buro J.A.Z.Z.'

/** Build an absolute URL on the canonical origin from a root-relative path. */
export function absoluteUrl(pathname = '/'): string {
  return new URL(pathname, `${SITE_URL}/`).toString()
}
