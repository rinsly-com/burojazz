/**
 * site.config.ts — the branding surface consumed by the shared engine's
 * `buildSiteConfig` (@rinsly-com/site-core). buildSiteConfig reads `url` +
 * `extraOrigins` (CORS/CSRF) and `seo` (the admin SEO-plugin defaults). The
 * frontend keeps its own branding (this project's `lib/siteUrl` etc. are unchanged).
 */
type Localized = { nl: string; en: string }

export const siteConfig = {
  name: 'Buro J.A.Z.Z.',
  // The live site is served from burojazz.nl; burojazz.com 301-redirects there.
  // This value is the site's identity, not just a link: it drives the canonical
  // tag, the sitemap, Open Graph, and the domain the admin's availability panel
  // asks the uptime monitor about. Naming the redirecting domain here made all
  // four point at an address the site does not actually serve from.
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://burojazz.nl').replace(/\/+$/, ''),
  themeColor: '#51c2cc',
  // The square brand mark, the same asset the site header renders.
  // (Was '/logo.svg', which does not exist in public/.)
  logo: '/images/header-hero/logo.svg',
  seo: {
    titleSuffix: ' — Buro J.A.Z.Z.',
    defaultTitle: 'Buro J.A.Z.Z.',
    description: {
      nl: 'Buro J.A.Z.Z. — jeugdzorg, advies, zorg en zekerheid.',
      en: 'Buro J.A.Z.Z. — youth care, advice, care and certainty.',
    } as Localized,
  },
  // Origins allowed to call the accp worker's API cross-origin (CORS/CSRF) —
  // chiefly the public static site POSTing the "Direct aanmelden" form. `url`
  // (burojazz.nl) is added implicitly; www and the accp origin are listed for
  // the same reason they always were. burojazz.com stays listed even though it
  // only redirects: dropping it would silently narrow CORS as a side effect of
  // a canonical-domain fix, and a redirect that is ever made a proxy would then
  // fail in a way nobody would connect back to this line.
  extraOrigins: [
    'https://burojazz.com',
    'https://www.burojazz.nl',
    'https://accp.burojazz.com',
  ] as string[],
} as const

export type SiteConfig = typeof siteConfig
