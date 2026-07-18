/**
 * site.config.ts — the branding surface consumed by the shared engine's
 * `buildSiteConfig` (@rinsly-com/site-core). buildSiteConfig reads `url` +
 * `extraOrigins` (CORS/CSRF) and `seo` (the admin SEO-plugin defaults). The
 * frontend keeps its own branding (this project's `lib/siteUrl` etc. are unchanged).
 */
type Localized = { nl: string; en: string }

export const siteConfig = {
  name: 'Buro J.A.Z.Z.',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://burojazz.com').replace(/\/+$/, ''),
  themeColor: '#51c2cc',
  logo: '/logo.svg',
  seo: {
    titleSuffix: ' — Buro J.A.Z.Z.',
    defaultTitle: 'Buro J.A.Z.Z.',
    description: {
      nl: 'Buro J.A.Z.Z. — jeugdzorg, advies, zorg en zekerheid.',
      en: 'Buro J.A.Z.Z. — youth care, advice, care and certainty.',
    } as Localized,
  },
  // The accp (CMS/admin) origin must be allow-listed so the static production
  // site can POST the "Direct aanmelden" form cross-origin to the accp worker.
  extraOrigins: ['https://accp.burojazz.com'] as string[],
} as const

export type SiteConfig = typeof siteConfig
