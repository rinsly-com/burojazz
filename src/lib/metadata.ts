import type { Metadata } from 'next'

import type { Page } from '@/payload-types'
import { absoluteUrl, SITE_NAME } from './siteUrl'

const DEFAULT_DESCRIPTION = 'Buro J.A.Z.Z. — jeugdzorg, advies, zorg en zekerheid.'

// The SEO plugin's `meta` group. Typed loosely so this helper compiles before
// `generate:types` picks up the plugin fields, and stays resilient if depth-0
// fetches return the image as an id instead of a populated Media doc.
type PageMeta = {
  title?: string | null
  description?: string | null
  image?: unknown
  noindex?: boolean | null
}

type PageWithMeta = Pick<Page, 'title'> & { meta?: PageMeta | null }

/**
 * Per-page metadata: title, description, canonical URL, and Open Graph / Twitter
 * tags. Editor-set `meta.title` / `meta.description` (SEO plugin) win over the
 * page title fallback. The OG/Twitter image is intentionally NOT set here — the
 * colocated `opengraph-image` route owns it (generated card, or the editor's
 * `meta.image` override) so exactly one image tag is emitted per page.
 */
export function buildPageMetadata(
  page: PageWithMeta,
  { path, homepage = false }: { path: string; homepage?: boolean },
): Metadata {
  const canonical = absoluteUrl(path)
  const metaTitle = page.meta?.title?.trim() || undefined
  const description = page.meta?.description?.trim() || DEFAULT_DESCRIPTION
  // Full title for OG/Twitter (no template applies there). The document <title>
  // uses `absolute` when the editor set a meta title (it already carries the
  // brand suffix) and the bare page title otherwise, so the layout's
  // `%s — Buro J.A.Z.Z.` template adds the suffix exactly once. On the homepage
  // with no editor title we defer to the layout's rich default title.
  const title: Metadata['title'] | undefined = metaTitle
    ? { absolute: metaTitle }
    : homepage
      ? undefined
      : page.title
  // OG/Twitter title: editor value, else the branded page title — but on the
  // homepage with no editor title, defer to the layout's default og:title.
  const socialTitle = metaTitle || (homepage ? undefined : `${page.title} — ${SITE_NAME}`)

  return {
    ...(title !== undefined ? { title } : {}),
    description,
    alternates: { canonical },
    // Per-page override: when the editor ticks noindex, block this page only
    // (wins over the layout's site-wide robots via metadata merging).
    ...(page.meta?.noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'nl_NL',
      url: canonical,
      ...(socialTitle ? { title: socialTitle } : {}),
      description,
    },
    twitter: {
      card: 'summary_large_image',
      ...(socialTitle ? { title: socialTitle } : {}),
      description,
    },
  }
}
