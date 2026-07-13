import type { MetadataRoute } from 'next'

import { SITE_NAME } from '@/lib/siteUrl'

// Web app manifest — brand colours, install metadata, and icons. Static by
// default, so it prerenders to /manifest.webmanifest in the export and Next
// auto-links it from every page.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Buro J.A.Z.Z. — jeugdzorg, advies, zorg en zekerheid',
    short_name: SITE_NAME,
    description: 'Buro J.A.Z.Z. — jeugdzorg, advies, zorg en zekerheid.',
    lang: 'nl',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#51c2cc',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
