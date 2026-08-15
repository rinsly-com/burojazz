import type { CSSProperties } from 'react'

import { Button } from '@/components/frontend/ui/Button'
import { Buttons } from '@/components/frontend/ui/CMSLink'
import { mediaUrl, resolveMedia } from '@rinsly-com/site-core/ui'
import { focalCrop } from '@/lib/focalCrop'
import { desktopPhotoStyle } from '@/lib/heroDesktopPhoto'
import { cfImageSrcSet } from '@rinsly-com/site-core/lib/image'
import type { Page } from '@/payload-types'
import { cmsText } from '@rinsly-com/site-core'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'hero' }>

const DEFAULT_IMAGE = '/images/header-hero/photo-2.jpg'
const IMAGE_ALT = 'Begeleider en jongere tijdens een bokstraining'

/** The mobile photo's box, matching its `aspect-[4/3]` wrapper. */
const MOBILE_PHOTO_ASPECT = 4 / 3

/**
 * Hero section: huge teal "BURO J.A.Z.Z." wordmark, subtitle, description and
 * two CTAs on the left; on the right a big white rounded plane behind a single
 * rotated photo driven by the CMS Hero image (desktop only). The floating
 * SiteHeader renders over this section, hence the generous top padding.
 * Server component — decorative shapes are CSS/images.
 */
export function Hero(props: Props) {
  const title = cmsText(props.header?.title, 'BURO J.A.Z.Z.')
  const subtitle = cmsText(props.header?.subtitle, 'Jeugdhulp en Ambulante Zorg met Zorgzaamheid')
  const description =
    props.header?.intro ??
    'Wij bieden ambulante jeugdhulp en jeugdhulp met verblijf, gericht op behandeling en begeleiding.'
  const media = resolveMedia(props.image)
  const imageUrl = mediaUrl(props.image, { width: 1600 }) ?? DEFAULT_IMAGE
  // Responsive srcset for the mobile hero photo (the mobile LCP element) so
  // phones fetch a viewport-sized variant instead of the fixed 1600px desktop
  // image. Only CMS media can be transformed; the /public fallback has none.
  const mobileImageSrcSet = cfImageSrcSet(media?.url ?? '')

  // Apply the CMS focal point so editors control the crop framing (the crop
  // itself is done in the browser — see Media.tsx). NOT via `object-position`:
  // that only pans on the axis where cover overflows, which left the hero's
  // focal Y doing nothing at all. `focalCrop` zooms past cover — only as far
  // as the focal point's distance from centre demands, so a centred focal is
  // a plain unzoomed cover — so both axes can move; with no known image
  // dimensions it also returns a plain centred cover, i.e. exactly what the
  // /public fallback image did before.
  const focal = { focalX: media?.focalX, focalY: media?.focalY }
  const mediaAspect = (media?.width ?? 0) / (media?.height ?? 0)

  // The desktop photo covers only the on-screen slice of the tilted card, so
  // the framing matches the design; the slice tracks the viewport's right
  // edge and converges smoothly on full-card coverage on ultrawide screens
  // (see heroDesktopPhoto.ts).
  const desktopStyle = desktopPhotoStyle({ mediaAspect, ...focal })

  const mobileCrop = focalCrop({ boxAspect: MOBILE_PHOTO_ASPECT, mediaAspect, ...focal })
  const mobilePhotoStyle: CSSProperties = {
    width: `${mobileCrop.widthRatio * 100}%`,
    height: `${mobileCrop.heightRatio * 100}%`,
    // `translate()` percentages resolve against the IMAGE's own size, so the
    // box-relative offsets are converted before use.
    transform: `translate(-50%, -50%) translate(${
      (mobileCrop.offsetXRatio / mobileCrop.widthRatio) * 100
    }%, ${(mobileCrop.offsetYRatio / mobileCrop.heightRatio) * 100}%)`,
  }
  // The photo can render wider than its box (that's what makes panning
  // possible), so `sizes` has to describe the zoomed width or the browser
  // picks a variant that is too small for this — the mobile LCP — image.
  const mobileSizes = `(min-width: 768px) ${Math.round(704 * mobileCrop.widthRatio)}px, ${Math.round(
    100 * mobileCrop.widthRatio,
  )}vw`

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Decorative desktop background, laid out on the 1512px design frame.
          Every offset below is in `cqw` — a percentage of THIS container's
          width — so the whole composition scales proportionally once the
          viewport drops under 1512 instead of being cropped at the edges. That
          matters because the photo enters from the right: a centred fixed-width
          frame lost ~106px off the right at 1300px, which is exactly where the
          subject stands. At >= 1512 the container caps out and the numbers
          resolve back to the design's pixel values. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[1512px] -translate-x-1/2 @container xl:block"
      >
        {/* Soft blurred teal blob, bottom-left */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/header-hero/blob-ellipse.svg"
          alt=""
          loading="lazy"
          className="absolute left-[-29.8942cqw] top-[17.5926cqw] size-[67.4603cqw] max-w-none"
        />
        {/* Giant rotated white rounded rect with soft shadow (the diagonal white plane) */}
        <div className="absolute left-[-12.8307cqw] top-[-35.7143cqw] flex h-[92.1296cqw] w-[120.6349cqw] items-center justify-center">
          <div className="h-[59.8545cqw] w-[106.8122cqw] shrink-0 rotate-[-19.56deg] rounded-[13.8889cqw] bg-white shadow-[0px_9px_26.9px_0px_rgba(0,0,0,0.12)]" />
        </div>
        {/* Main photo, right side (from the CMS Hero image). The frame is
            rotated -30° so it reads as a tilted panel, but the image itself is
            counter-rotated +30° (net upright) and object-cover, so the photo
            stays horizontal and fills the frame instead of being cropped askew. */}
        <div className="absolute left-[54.1005cqw] top-[-11.1111cqw] flex h-[106.8783cqw] w-[104.5635cqw] items-center justify-center">
          <div className="relative h-[80.4894cqw] w-[74.2063cqw] shrink-0 rotate-[-30deg] overflow-hidden rounded-[5.291cqw]">
            {/* Desktop LCP photo. loading=lazy so mobile (where this whole
                composition is display:none) never fetches this 1600px variant;
                on desktop it's in the initial viewport, so it still loads —
                with fetchpriority=high to win the race there. Sizing and pan
                come from the CMS focal point via heroDesktopPhoto.ts. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              loading="lazy"
              fetchPriority="high"
              className="absolute left-1/2 top-1/2 max-w-none object-cover"
              style={desktopStyle}
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

          {/* Mobile/tablet photo (replaces the rotated desktop composition).
              This is the mobile LCP element, so it loads eagerly with
              fetchpriority=high and a viewport-sized srcset. */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[40px] xl:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              srcSet={mobileImageSrcSet}
              sizes={mobileImageSrcSet ? mobileSizes : undefined}
              alt={IMAGE_ALT}
              loading="eager"
              fetchPriority="high"
              className="absolute left-1/2 top-1/2 max-w-none object-cover"
              style={mobilePhotoStyle}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
