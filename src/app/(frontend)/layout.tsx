import type { Metadata, Viewport } from 'next'
import React from 'react'
import { Mona_Sans, Montserrat } from 'next/font/google'

import { AanmeldenDialog } from '@/components/frontend/aanmelden/AanmeldenDialog'
import { JsonLd } from '@/components/frontend/JsonLd'
import { SiteFooter } from '@/components/frontend/SiteFooter'
import { SiteHeader } from '@/components/frontend/SiteHeader'
import { getFooter, getHeader } from '@/lib/globals'
import { SITE_NAME, SITE_URL } from '@/lib/siteUrl'
import { buildSiteJsonLd } from '@/lib/structuredData'

import './globals.css'
import './styles.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

const monaSans = Mona_Sans({
  subsets: ['latin'],
  variable: '--font-mona-sans',
  display: 'swap',
})

// Only the production static export (BUILD_STATIC=true, served at burojazz.com)
// should be indexed. The accp worker is a live admin/preview surface, so it
// advertises noindex,nofollow (evaluated at module load — BUILD_STATIC is unset
// there). robots.ts enforces the same split at the /robots.txt level.
const IS_STATIC_PROD = process.env.BUILD_STATIC === 'true'
const DEFAULT_DESCRIPTION = 'Buro J.A.Z.Z. — jeugdzorg, advies, zorg en zekerheid.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Buro J.A.Z.Z. — jeugdzorg, advies, zorg en zekerheid',
    template: `%s — ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'nl_NL',
    url: SITE_URL,
    title: 'Buro J.A.Z.Z. — jeugdzorg, advies, zorg en zekerheid',
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buro J.A.Z.Z. — jeugdzorg, advies, zorg en zekerheid',
    description: DEFAULT_DESCRIPTION,
  },
  robots: IS_STATIC_PROD
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
}

// Brand theme color for the mobile browser chrome / PWA.
export const viewport: Viewport = {
  themeColor: '#51c2cc',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const [header, footer] = await Promise.all([getHeader(), getFooter()])

  // Organization / WebSite (→ LocalBusiness when a footer address is set) graph,
  // emitted site-wide so search engines can build a knowledge-panel entity and
  // surface the buro's contact details.
  const siteJsonLd = buildSiteJsonLd(footer)

  return (
    <html lang="nl">
      <body className={`${montserrat.variable} ${monaSans.variable} font-sans`}>
        <JsonLd data={siteJsonLd} />
        <SiteHeader header={header} />
        <main>{children}</main>
        <SiteFooter footer={footer} />
        <AanmeldenDialog />
      </body>
    </html>
  )
}
