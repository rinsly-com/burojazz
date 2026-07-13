import type { MetadataRoute } from 'next'

import { getRenderablePages } from '@/lib/pages'
import { absoluteUrl } from '@/lib/siteUrl'

// Route handlers are not static-by-default under `output: export` (Next 16), so
// force-static is required for the export. getRenderablePages reads the prebuilt
// snapshot at build time (no headers()), so it prerenders cleanly to a static
// /sitemap.xml. On the accp worker it renders once at build too — that surface
// is disallowed in robots.ts anyway.
export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getRenderablePages()

  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/aanmelden'), changeFrequency: 'monthly', priority: 0.8 },
  ]

  const pageEntries: MetadataRoute.Sitemap = pages
    // "home" is served at "/" (covered above); drop drafts defensively — the
    // static build already queries published only, this guards the worker path.
    .filter(
      (page) =>
        page.slug &&
        page.slug !== 'home' &&
        (page as { _status?: string })._status !== 'draft',
    )
    .map((page) => ({
      url: absoluteUrl(`/${page.slug}`),
      lastModified: page.updatedAt ? new Date(page.updatedAt) : undefined,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  return [...staticEntries, ...pageEntries]
}
