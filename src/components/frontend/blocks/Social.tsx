import Link from 'next/link'

import type { Page } from '@/payload-types'
import { ArrowIcon } from '@/components/frontend/ui/ArrowIcon'
import { Eyebrow } from '@/components/frontend/ui/Eyebrow'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'social' }>

/** Small phone glyph used in the eyebrow pill (stroke follows currentColor). */
function PhoneIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8.4 3.2c.5 0 .95.3 1.13.77l1.1 2.87a1.2 1.2 0 0 1-.3 1.3L8.9 9.5a11.6 11.6 0 0 0 5.6 5.6l1.36-1.43a1.2 1.2 0 0 1 1.3-.3l2.87 1.1c.46.18.77.63.77 1.13v2.6a2.2 2.2 0 0 1-2.4 2.2C10.55 19.55 4.45 13.45 3.6 5.6a2.2 2.2 0 0 1 2.2-2.4h2.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * "Samen in verbinding, ook online" — Instagram/social section.
 * Light-teal full-bleed band with a centered intro, a hand-held phone
 * collage surrounded by rotated snapshot photos, a hand-drawn arrow with
 * "Kijk achter de schermen!" and a teal @buro.jazz Instagram badge.
 */
export function Social(props: Props) {
  const title = props.title ?? 'Samen in verbinding, ook online'
  const handle = props.handle ?? '@buro.jazz'
  const subtitle =
    props.subtitle ?? 'We delen inzichten, verhalen en inspiratie uit onze dagelijkse praktijk.'
  const linkLabel = props.linkLabel ?? 'Volg ons op Instagram'
  const linkUrl = props.linkUrl ?? 'https://www.instagram.com/buro.jazz'

  return (
    <div className="relative overflow-hidden bg-[#e5f6f7]">
      {/* Soft teal glow toward the top right, matching the design's blurred ellipse. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 85% -10%, rgba(81,194,204,0.28) 0%, rgba(81,194,204,0) 60%)',
        }}
      />

      <Section py="pt-16 pb-0 md:pt-28" className="relative">
        {/* Intro */}
        <div className="relative z-10 mx-auto flex max-w-[700px] flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2.5 rounded-pill bg-brand/5 px-3 py-2.5 text-brand">
            <PhoneIcon />
            <Eyebrow className="leading-none">Social Media</Eyebrow>
          </div>
          <h2 className="font-semibold text-[28px] leading-[1.2] tracking-[0.02em] text-black md:text-[40px]">
            {title}
          </h2>
          <p className="max-w-[549px] text-sm font-medium text-ink">{subtitle}</p>
        </div>

        {/* Collage */}
        <div className="relative mt-10 md:mt-20">
          {/* Left snapshots */}
          <img
            src="/images/social/photo-toys.jpg"
            alt=""
            className="absolute left-[-2%] top-[8%] z-20 hidden w-[9%] rotate-2 rounded-[24px] object-cover shadow-[0px_3px_16px_0px_rgba(0,0,0,0.1)] sm:block"
          />
          <img
            src="/images/social/photo-gym.jpg"
            alt=""
            className="absolute left-[8%] top-[16%] z-20 hidden aspect-[3/4] w-[14%] -rotate-[15deg] rounded-[24px] object-cover shadow-[0px_3px_16px_0px_rgba(0,0,0,0.1)] sm:block"
          />

          {/* Right snapshots */}
          <img
            src="/images/social/photo-boxing.png"
            alt=""
            className="absolute right-[13%] top-[17%] z-20 hidden w-[19%] sm:block"
          />
          <img
            src="/images/social/photo-figures.jpg"
            alt=""
            className="absolute right-[4%] top-[-4%] z-20 hidden aspect-[3/4] w-[12%] rotate-[15deg] rounded-[24px] object-cover shadow-[0px_3px_16px_0px_rgba(0,0,0,0.1)] sm:block"
          />

          {/* Hand-drawn arrow + "Kijk achter de schermen!" */}
          <div className="absolute right-[-2%] top-[24%] z-20 hidden w-[14%] flex-col items-center lg:flex">
            <img
              src="/images/social/arrow-doodle.svg"
              alt=""
              className="h-auto w-[40%] -scale-y-100 -rotate-[34deg]"
            />
            <p className="mt-3 text-center text-[20px] font-semibold leading-[1.2] tracking-[0.02em] text-black">
              Kijk <span className="text-brand">achter</span> de schermen!
            </p>
          </div>

          {/* Phone in hand (cropped like the design frame) */}
          <div className="relative mx-auto aspect-[762/694] w-full max-w-[560px] overflow-hidden md:max-w-[762px]">
            <img
              src="/images/social/phone-hand.png"
              alt={`Telefoon met de Instagram-feed van ${handle}`}
              className="absolute left-[-33.4%] top-[-34.15%] h-[146.41%] w-[166.8%] max-w-none"
            />
          </div>

          {/* Fade the bottom of the collage into the section background. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[55%] bg-gradient-to-b from-transparent to-[#e5f6f7]"
          />

          {/* Instagram badge */}
          <Link
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-[4%] left-1/2 z-30 block -translate-x-1/2 rounded-[24px] border border-ink/5 bg-brand p-3 shadow-[-34px_33px_47px_0px_rgba(81,194,204,0.15),-8px_8px_26px_0px_rgba(81,194,204,0.2)] transition-transform hover:scale-[1.03] md:left-[56%] md:translate-x-0"
            style={{
              backgroundImage:
                'radial-gradient(140% 140% at 15% 0%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%)',
            }}
          >
            <span className="flex w-[281px] items-center gap-6">
              <img src="/images/social/instagram.svg" alt="Instagram" className="size-[60px] shrink-0" />
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-[20px] font-bold leading-normal text-white">{handle}</span>
                <span className="flex items-center gap-2.5 text-sm font-medium text-white">
                  {linkLabel}
                  <ArrowIcon />
                </span>
              </span>
            </span>
          </Link>
        </div>
      </Section>
    </div>
  )
}
