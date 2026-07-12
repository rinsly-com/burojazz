'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef } from 'react'

import { Media, type MediaResource } from '@/components/frontend/ui/Media'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type Photos =
  | {
      toys?: MediaResource
      gym?: MediaResource
      boxing?: MediaResource
      figures?: MediaResource
      arrow?: MediaResource
    }
  | null
  | undefined

const SHADOW = 'shadow-[0px_3px_16px_0px_rgba(0,0,0,0.1)]'

/**
 * The four snapshot photos floating around the phone in the Social collage,
 * with a scroll-linked parallax drift. All snapshots move the SAME direction
 * (upward as you scroll down); the speed scales with how close each sits to the
 * screen edge — the edge-most photos drift fastest, the ones nearer the centre
 * slowest (see each wrapper's `data-parallax`). Each snapshot's positioning
 * wrapper is translated by GSAP (`y`) while the inner image keeps its own
 * `rotate` transform, so the two never fight over the CSS transform.
 *
 * Progressive enhancement: the images render statically from the server; the
 * parallax is added only on ≥sm viewports with no reduced-motion preference
 * (which also matches where the snapshots are visible — they're `hidden` below
 * `sm`). Reduced-motion users get the static collage.
 */
export function SocialParallax({ photos }: { photos?: Photos }) {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 640px) and (prefers-reduced-motion: no-preference)', () => {
        const layers = gsap.utils.toArray<HTMLElement>('[data-parallax]', scope.current)
        // The collage container (this component renders with display:contents, so
        // its DOM parent is the positioned collage box) drives the scroll range.
        const trigger = scope.current?.parentElement ?? scope.current
        const tweens = layers.map((el) =>
          gsap.to(el, {
            // Pixel-based (not yPercent) so layers of different heights move by
            // the exact same amount when they share a value — that's what lets
            // the callout stick to the rightmost photo.
            y: Number(el.dataset.parallax),
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }),
        )
        return () => tweens.forEach((t) => t.scrollTrigger?.kill())
      })
      return () => mm.revert()
    },
    { scope },
  )

  return (
    <div ref={scope} className="contents">
      {/* Left snapshots — edge-most (toys) drifts fastest. */}
      <div data-parallax="-85" className="absolute left-[-2%] top-[8%] z-20 hidden w-[9%] sm:block">
        <Media
          resource={photos?.toys}
          fallbackSrc="/images/social/photo-toys.jpg"
          alt=""
          className={`w-full rotate-2 rounded-[24px] ${SHADOW}`}
        />
      </div>
      <div data-parallax="-62" className="absolute left-[8%] top-[16%] z-20 hidden w-[14%] sm:block">
        <Media
          resource={photos?.gym}
          fallbackSrc="/images/social/photo-gym.jpg"
          alt=""
          className={`aspect-[3/4] w-full -rotate-[15deg] rounded-[24px] ${SHADOW}`}
        />
      </div>

      {/* Right snapshots — boxing sits most inward, so it drifts slowest. */}
      <div data-parallax="-48" className="absolute right-[13%] top-[17%] z-20 hidden w-[19%] sm:block">
        <Media
          resource={photos?.boxing}
          fallbackSrc="/images/social/photo-boxing.png"
          alt=""
          className="w-full"
        />
      </div>
      <div data-parallax="-85" className="absolute right-[4%] top-[-4%] z-20 hidden w-[12%] sm:block">
        <Media
          resource={photos?.figures}
          fallbackSrc="/images/social/photo-figures.jpg"
          alt=""
          className={`aspect-[3/4] w-full rotate-[15deg] rounded-[24px] ${SHADOW}`}
        />
      </div>

      {/* Hand-drawn arrow + "Kijk achter de schermen!" — same speed (-85) as the
          rightmost photo so it stays stuck to it while scrolling. */}
      <div
        data-parallax="-85"
        className="absolute right-[-2%] top-[24%] z-20 hidden w-[14%] flex-col items-center lg:flex"
      >
        <Media
          resource={photos?.arrow}
          fallbackSrc="/images/social/arrow-doodle.svg"
          alt=""
          fit="contain"
          className="h-auto w-[40%] -scale-y-100 -rotate-[34deg]"
        />
        <p className="mt-3 text-center text-[20px] font-semibold leading-[1.2] tracking-[0.02em] text-black">
          Kijk <span className="text-brand">achter</span> de schermen!
        </p>
      </div>
    </div>
  )
}

export default SocialParallax
