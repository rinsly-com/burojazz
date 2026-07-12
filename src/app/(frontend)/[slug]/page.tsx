import { notFound } from 'next/navigation'
import React from 'react'

import { PageView } from '@/components/frontend/PageView'
import { RenderBlocks } from '@/components/frontend/RenderBlocks'
import { getRenderablePageBySlug, getRenderablePages } from '@/lib/pages'
import '../styles.css'

// Only pre-generated slugs render (required for the static export). The set is
// mode-aware: production build → published only; preview (dev/accp) build →
// published + Ready pages, so approved content is previewable but never ships
// to the production static build.
export const dynamicParams = false

export async function generateStaticParams() {
  const pages = await getRenderablePages()
  return pages.map((page) => ({ slug: page.slug }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getRenderablePageBySlug(slug)

  if (!page) notFound()

  if (page.layout?.length) {
    return <RenderBlocks layout={page.layout} />
  }

  return <PageView page={page} />
}
