import type { Metadata } from 'next'
import React from 'react'

import config from '@payload-config'
import { resolveI18n } from '@rinsly-com/site-core/lib/locale'
import { PreviewRuntime } from '@rinsly-com/site-core/preview'

import { JsonLd } from '@/components/frontend/JsonLd'
import { RenderBlocks } from '@/components/frontend/RenderBlocks'
import { buildPageMetadata } from '@/lib/metadata'
import { getRenderablePageBySlug, getRenderablePages } from '@/lib/pages'
import { resolvePreview, type SearchParams } from '@/lib/preview'
import { buildPageJsonLd } from '@/lib/structuredData'

// accp worker: render on demand so the homepage always reflects live content.
// The static production export (build-static.mjs) strips this so it can prerender.
export const dynamic = 'force-dynamic'

// A loader, not an import. The shell is a client module reaching this site's
// block renderers and, through them, the whole icon barrel; importing it here
// would ship all of that to every public visitor. build-static.mjs rewrites this
// to `undefined` for the static export (output: export still bundles dynamic
// imports).
const loadPreviewShell: (() => Promise<typeof import('@/components/PreviewShell')>) | undefined =
  () => import('@/components/PreviewShell')

export async function generateMetadata(): Promise<Metadata> {
  const page = await getRenderablePageBySlug('home')
  if (!page) return {}
  return buildPageMetadata(page, { path: '/', homepage: true })
}

/**
 * Home route: renders the "home" page's block layout when it exists;
 * otherwise falls back to the starter list of renderable pages.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const { isPreview, serverURL } = await resolvePreview({ config, searchParams })
  const page = await getRenderablePageBySlug('home')

  if (page?.layout?.length) {
    if (isPreview && loadPreviewShell) {
      const { PreviewShell } = await loadPreviewShell()
      return (
        <>
          <PreviewRuntime serverURL={serverURL} />
          <PreviewShell
            // Owned Pages layout ≠ core Page type; shell only needs the document shape at runtime.
            initialPage={page as React.ComponentProps<typeof PreviewShell>['initialPage']}
            // site.config has no i18n field. An empty argument is the weak
            // { i18n?: … } parameter, so the resolved default stays the package
            // default (the former DEFAULT_LOCALE). Do not invent locales here.
            locale={resolveI18n({}).defaultLocale}
            serverURL={serverURL}
          />
        </>
      )
    }

    const jsonLd = buildPageJsonLd(page)
    return (
      <>
        {jsonLd.length > 0 && <JsonLd data={jsonLd} />}
        <RenderBlocks layout={page.layout} />
      </>
    )
  }

  const pages = await getRenderablePages()

  return (
    <div className="home">
      <div className="content">
        <h1>burojazz</h1>
        {pages.length === 0 ? (
          <p>No published pages yet.</p>
        ) : (
          <ul className="links">
            {pages.map((p) => (
              <li key={p.id}>
                <a href={`/${p.slug}`}>{p.title}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
