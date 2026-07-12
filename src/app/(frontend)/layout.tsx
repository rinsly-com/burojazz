import React from 'react'
import { Mona_Sans, Montserrat } from 'next/font/google'

import { AanmeldenDialog } from '@/components/frontend/aanmelden/AanmeldenDialog'
import { SiteFooter } from '@/components/frontend/SiteFooter'
import { SiteHeader } from '@/components/frontend/SiteHeader'
import { getFooter, getHeader } from '@/lib/globals'

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

export const metadata = {
  description: 'Buro J.A.Z.Z. — Jeugdzorg, Advies, Zorg en Zekerheid.',
  title: 'Buro J.A.Z.Z.',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const [header, footer] = await Promise.all([getHeader(), getFooter()])

  return (
    <html lang="nl">
      <body className={`${montserrat.variable} ${monaSans.variable} font-sans`}>
        <SiteHeader header={header} />
        <main>{children}</main>
        <SiteFooter footer={footer} />
        <AanmeldenDialog />
      </body>
    </html>
  )
}
