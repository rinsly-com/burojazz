import { Button } from '@/components/frontend/ui/Button'
import { Buttons } from '@/components/frontend/ui/CMSLink'
import { mediaUrl } from '@/components/frontend/ui/Media'
import type { Page } from '@/payload-types'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'hero' }>

const DEFAULT_IMAGE = '/images/header-hero/photo-2.jpg'
const IMAGE_ALT = 'Begeleider en jongere tijdens een bokstraining'

/**
 * Hero section: huge teal "BURO J.A.Z.Z." wordmark, subtitle, description and
 * two CTAs on the left; on the right a big white rounded plane behind a single
 * rotated photo driven by the CMS Hero image (desktop only). The floating
 * SiteHeader renders over this section, hence the generous top padding.
 * Server component — decorative shapes are CSS/images.
 */
export function Hero(props: Props) {
  const title = props.header?.title ?? 'BURO J.A.Z.Z.'
  const subtitle = props.header?.subtitle ?? 'Jeugdhulp en Ambulante Zorg met Zorgzaamheid'
  const description =
    props.header?.intro ??
    'Wij bieden ambulante jeugdhulp en jeugdhulp met verblijf, gericht op behandeling en begeleiding.'
  const imageUrl = mediaUrl(props.image, { width: 1600 }) ?? DEFAULT_IMAGE

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
        {/* Giant rotated white rounded rect with soft shadow (the diagonal white plane) */}
        <div className="absolute left-[-194px] top-[-540px] flex h-[1393px] w-[1824px] items-center justify-center">
          <div className="h-[905px] w-[1615px] shrink-0 rotate-[-19.56deg] rounded-[210px] bg-white shadow-[0px_9px_26.9px_0px_rgba(0,0,0,0.12)]" />
        </div>
        {/* Main photo, right side (from the CMS Hero image). The frame is
            rotated -30° so it reads as a tilted panel, but the image itself is
            counter-rotated +30° (net upright) and object-cover, so the photo
            stays horizontal and fills the frame instead of being cropped askew. */}
        <div className="absolute left-[818px] top-[-168px] flex h-[1616px] w-[1581px] items-center justify-center">
          <div className="relative h-[1217px] w-[1122px] shrink-0 rotate-[-30deg] overflow-hidden rounded-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="absolute left-1/2 top-1/2 h-[1616px] w-[1581px] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-[30deg] object-cover"
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

          {props.buttons?.length ? (
            <Buttons buttons={props.buttons} />
          ) : (
            <div className="flex flex-wrap items-center gap-6">
              <Button label="Direct aanmelden" href="/aanmelden" />
              <Button label="Neem contact op" href="/contact" variant="secondary" />
            </div>
          )}

          {/* Mobile/tablet photo (replaces the rotated desktop composition) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={IMAGE_ALT}
            className="aspect-[4/3] w-full rounded-[40px] object-cover xl:hidden"
          />
        </div>
      </div>
    </section>
  )
}

export default Hero
