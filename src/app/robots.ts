import type { MetadataRoute } from 'next'

import { absoluteUrl, SITE_URL } from '@/lib/siteUrl'

// Only the production static export (BUILD_STATIC=true, burojazz.com) should be
// crawlable. The accp worker (admin/preview) returns a blanket disallow — this
// is baked at that build's module load, where BUILD_STATIC is unset. Mirrors the
// noindex robots meta the (frontend) layout emits on accp.
const IS_STATIC_PROD = process.env.BUILD_STATIC === 'true'

export default function robots(): MetadataRoute.Robots {
  if (!IS_STATIC_PROD) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  }
}
