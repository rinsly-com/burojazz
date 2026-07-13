import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { JsonLd } from '@/components/frontend/JsonLd'
import { PageView } from '@/components/frontend/PageView'
import { RenderBlocks } from '@/components/frontend/RenderBlocks'
import { buildPageMetadata } from '@/lib/metadata'
import { getRenderablePageBySlug, getRenderablePages } from '@/lib/pages'
import { buildPageJsonLd } from '@/lib/structuredData'
import '../styles.css'

// On the accp worker, pages.ts reads request headers to self-fetch its API,
// which makes this route render dynamically — any published slug renders on
// demand, no rebuild. `dynamicParams = true` allows slugs beyond the prebuilt
// set. For the static production export, generateStaticParams prerenders the
// published slugs (headers() is never read in that mode, so it stays static).
// accp worker: render every slug on demand (live preview). The static production
// export (build-static.mjs) strips `dynamic` so it can prerender published slugs.
export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateStaticParams() {
  // Worker (preview): render every slug on demand — nothing to prebuild, and we
  // must not call the headers()-based fetch here (generateStaticParams runs at
  // build with no request). Static export: prerender the published slugs.
  if (process.env.BUILD_STATIC !== 'true') return []
  const pages = await getRenderablePages()
  return pages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getRenderablePageBySlug(slug)
  if (!page) return {}
  return buildPageMetadata(page, { path: `/${slug}` })
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getRenderablePageBySlug(slug)

  if (!page) notFound()

  const jsonLd = buildPageJsonLd(page)

  if (page.layout?.length) {
    return (
      <>
        {jsonLd.length > 0 && <JsonLd data={jsonLd} />}
        <RenderBlocks layout={page.layout} />
      </>
    )
  }

  return <PageView page={page} />
}
