import { OG_SIZE, renderOgImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Direct aanmelden — Buro J.A.Z.Z.'

// Static route (no CMS page): a fixed branded card for the aanmelden wizard.
export default function Image() {
  return renderOgImage({ title: 'Direct aanmelden' })
}
