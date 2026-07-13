import type { Metadata } from 'next'

import { AanmeldenForm } from '@/components/frontend/aanmelden/AanmeldenForm'
import { Section } from '@/components/frontend/ui/Section'
import { absoluteUrl, SITE_NAME } from '@/lib/siteUrl'

const TITLE = 'Direct aanmelden'
const DESCRIPTION = 'Meld je aan voor jeugdhulp en ambulante zorg bij Buro J.A.Z.Z.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl('/aanmelden') },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'nl_NL',
    url: absoluteUrl('/aanmelden'),
    title: `${TITLE} — ${SITE_NAME}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} — ${SITE_NAME}`,
    description: DESCRIPTION,
  },
}

/**
 * Full-page fallback for the aanmelden wizard. With JS enabled, the layout's
 * AanmeldenDialog intercepts clicks to /aanmelden and opens the modal instead;
 * this page keeps the flow working without JS and as a shareable deep-link.
 */
export default function AanmeldenPage() {
  return (
    <Section py="pb-24 pt-[140px] md:pt-[180px]">
      <div className="mx-auto flex max-w-[920px] flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-3xl font-black tracking-tight text-brand md:text-5xl">
            Direct aanmelden
          </h1>
          <p className="max-w-2xl text-sm font-medium text-ink">
            Vul onderstaand formulier in om je aan te melden. We nemen daarna zo snel mogelijk
            contact met je op.
          </p>
        </div>
        <AanmeldenForm />
      </div>
    </Section>
  )
}
