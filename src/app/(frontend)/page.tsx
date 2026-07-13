import type { Metadata } from 'next'
import React from 'react'

import { JsonLd } from '@/components/frontend/JsonLd'
import { RenderBlocks } from '@/components/frontend/RenderBlocks'
import { buildPageMetadata } from '@/lib/metadata'
import { getRenderablePageBySlug, getRenderablePages } from '@/lib/pages'
import { buildPageJsonLd } from '@/lib/structuredData'
import './styles.css'

// accp worker: render on demand so the homepage always reflects live content.
// The static production export (build-static.mjs) strips this so it can prerender.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getRenderablePageBySlug('home')
  if (!page) return {}
  return buildPageMetadata(page, { path: '/', homepage: true })
}

/**
 * Home route: renders the "home" page's block layout when it exists;
 * otherwise falls back to the starter list of renderable pages.
 */
export default async function HomePage() {
  const page = await getRenderablePageBySlug('home')

  if (page?.layout?.length) {
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
