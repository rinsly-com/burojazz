import { OG_SIZE, renderOgImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Direct aanmelden — Buro J.A.Z.Z.'

// OG-image routes compile to Route Handlers, which `output: export` does not
// treat as static-by-default (unlike pages): without this they fail static
// page-data collection. The card is fixed content, so force-static everywhere.
export const dynamic = 'force-static'

// Static route (no CMS page): a fixed branded card for the aanmelden wizard.
export default function Image() {
  return renderOgImage({ title: 'Direct aanmelden' })
}
