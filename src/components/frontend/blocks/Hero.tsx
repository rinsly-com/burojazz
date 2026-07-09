import Link from 'next/link'

import { ArrowIcon } from '@/components/frontend/ui/ArrowIcon'
import { Button } from '@/components/frontend/ui/Button'
import type { Page } from '@/payload-types'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'hero' }>

/**
 * Hero section: huge teal "BURO J.A.Z.Z." wordmark, subtitle, description,
 * two CTAs and the Kiwa certification callout on the left; rotated
 * rounded-photo imagery with organic shapes on the right (desktop only).
 * The floating SiteHeader renders over this section, hence the generous
 * top padding. Server component — decorative shapes are pure CSS/images.
 */
export function Hero(props: Props) {
  const title = props.title ?? 'BURO J.A.Z.Z.'
  const subtitle = props.subtitle ?? 'Jeugdhulp en Ambulante Zorg met Zorgzaamheid'
  const description =
    props.description ??
    'Wij bieden ambulante jeugdhulp en jeugdhulp met verblijf, gericht op behandeling en begeleiding.'
  const primaryCta = {
    label: props.primaryCta?.label ?? 'Direct aanmelden',
    url: props.primaryCta?.url ?? '/aanmelden',
  }
  const secondaryCta = {
    label: props.secondaryCta?.label ?? 'Neem contact op',
    url: props.secondaryCta?.url ?? '/contact',
  }
  const cert = {
    title: props.cert?.title ?? 'Kiwa gecertificeerd',
    text:
      props.cert?.text ??
      'Buro J.A.Z.Z. is Kiwa gecertificeerd en voldoet aan de kwaliteitseisen voor jeugdhulp.',
    linkLabel: props.cert?.linkLabel ?? 'Lees meer',
    linkUrl: props.cert?.linkUrl ?? '/over-ons',
  }

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Decorative desktop background: composition anchored to the 1512px design frame. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-[1512px] -translate-x-1/2 xl:block"
      >
        {/* Soft blurred teal blob, bottom-left */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/header-hero/blob-ellipse.svg"
          alt=""
          className="absolute left-[-452px] top-[266px] size-[1020px] max-w-none"
        />
        {/* Underlying rotated photo (peeks out top-right) */}
        <div className="absolute left-[821px] top-[-215px] flex h-[1302px] w-[1455px] items-center justify-center">
          <div className="h-[1217px] w-[801px] shrink-0 rotate-[-120deg] overflow-hidden rounded-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/header-hero/photo-1.jpg"
              alt=""
              className="size-full object-cover"
            />
          </div>
        </div>
        {/* Giant rotated white rounded rect with soft shadow (the diagonal white plane) */}
        <div className="absolute left-[-194px] top-[-540px] flex h-[1393px] w-[1824px] items-center justify-center">
          <div className="h-[905px] w-[1615px] shrink-0 rotate-[-19.56deg] rounded-[210px] bg-white shadow-[0px_9px_26.9px_0px_rgba(0,0,0,0.12)]" />
        </div>
        {/* Main rotated photo, right side */}
        <div className="absolute left-[818px] top-[-168px] flex h-[1616px] w-[1581px] items-center justify-center">
          <div className="relative h-[1217px] w-[1122px] shrink-0 rotate-[-30deg] overflow-hidden rounded-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/header-hero/photo-2.jpg"
              alt=""
              className="absolute left-[-22.8%] top-[-68.11%] h-[115.47%] w-[132.69%] max-w-none"
            />
            <div className="absolute inset-0 bg-black/[0.03]" />
          </div>
        </div>
      </div>

      {/* Simplified decorative blob for mobile/tablet */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-brand/25 blur-[90px] xl:hidden"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1512px] px-6 pb-16 pt-[130px] md:px-20 md:pt-[160px] xl:min-h-[888px] xl:px-[120px] xl:pb-24 xl:pt-[190px]">
        <div className="flex max-w-[754px] flex-col items-start gap-10">
          <div className="flex flex-col gap-6">
            <h1 className="font-display text-[clamp(44px,8.5vw,76px)] font-black leading-[1.15] tracking-[-0.02em] text-brand">
              {title}
            </h1>
            <p className="max-w-[504px] text-[clamp(26px,5vw,40px)] font-semibold leading-[1.2] tracking-[0.02em] text-black">
              {subtitle}
            </p>
            <p className="max-w-[549px] text-sm font-medium leading-normal text-ink">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Button label={primaryCta.label} href={primaryCta.url} />
            <Button label={secondaryCta.label} href={secondaryCta.url} variant="secondary" />
          </div>

          {/* Kiwa certification callout card */}
          <div className="max-w-[420px] rounded-[32px] bg-white p-6 shadow-[0px_9px_26.9px_0px_rgba(0,0,0,0.1)]">
            <p className="text-sm font-semibold text-ink">{cert.title}</p>
            <p className="mt-2 text-sm font-medium leading-normal text-ink/80">{cert.text}</p>
            <Link
              href={cert.linkUrl}
              className="mt-3 inline-flex items-center gap-2.5 text-sm font-medium text-brand transition-colors hover:text-[#3fadb7]"
            >
              {cert.linkLabel}
              <ArrowIcon />
            </Link>
          </div>

          {/* Mobile/tablet photo (replaces the rotated desktop composition) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/header-hero/photo-2.jpg"
            alt="Begeleider en jongere tijdens een bokstraining"
            className="aspect-[4/3] w-full rounded-[40px] object-cover xl:hidden"
          />
        </div>
      </div>
    </section>
  )
}

export default Hero
