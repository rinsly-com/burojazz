import { AanmeldenForm } from '@/components/frontend/aanmelden/AanmeldenForm'
import { Section } from '@/components/frontend/ui/Section'

export const metadata = {
  title: 'Direct aanmelden — Buro J.A.Z.Z.',
  description: 'Meld je aan voor jeugdhulp en ambulante zorg bij Buro J.A.Z.Z.',
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
