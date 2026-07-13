import { metaImageUrl, OG_SIZE, renderOgImage } from '@/lib/og'
import { getRenderablePageBySlug, getRenderablePages } from '@/lib/pages'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Buro J.A.Z.Z.'

// accp worker: render any slug's card on demand. build-static.mjs flips this to
// `false` for the static export so only the prerendered published slugs (from
// generateStaticParams) are built — mirrors the sibling page.tsx.
export const dynamicParams = true

export async function generateStaticParams() {
  if (process.env.BUILD_STATIC !== 'true') return []
  const pages = await getRenderablePages()
  return pages.map((page) => ({ slug: page.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getRenderablePageBySlug(slug)
  return renderOgImage({
    title: page?.title || 'Buro J.A.Z.Z.',
    imageUrl: metaImageUrl(page),
  })
}
