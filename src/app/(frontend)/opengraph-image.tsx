import { metaImageUrl, OG_SIZE, renderOgImage } from '@/lib/og'
import { getRenderablePageBySlug } from '@/lib/pages'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Buro J.A.Z.Z. — jeugdzorg, advies, zorg en zekerheid'

// OG-image routes compile to Route Handlers, which `output: export` does not
// treat as static-by-default (unlike pages): without this they fail static
// page-data collection. Rendered once from the content snapshot at build time
// (the static site rebuilds on every publish), so force-static is correct.
export const dynamic = 'force-static'

// Homepage OG card: the "home" page's title (or meta.image override).
export default async function Image() {
  const page = await getRenderablePageBySlug('home')
  return renderOgImage({
    title: page?.title || 'Buro J.A.Z.Z.',
    imageUrl: metaImageUrl(page),
  })
}
