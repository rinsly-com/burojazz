'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, useState, type ReactNode } from 'react'

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin)

export type StepPill = {
  key: string
  /** Pre-rendered on the server so the Tabler barrel never ships to the client. */
  icon: ReactNode
  tone: 'brand' | 'danger'
  text: string
  note?: string | null
}

export type Step = {
  key: string
  title: string
  text?: string | null
  pills: StepPill[]
}

type Props = {
  eyebrowIcon: ReactNode
  eyebrow: string
  title: string
  intro: string
  steps: Step[]
  /** Optional "Nog vragen?" card, pre-rendered on the server. Added to the track
   *  as the final snap slide so it snaps into place after the last step. */
  contactCard?: ReactNode
}

/** Vertical fraction of the card viewport per scroll step (also the pin length). */
const STEP_SCROLL = 0.85
/** Card viewport height while pinned; leaves room for a peek of the next card. */
const VIEWPORT_MAX = '78vh'

/** Small curved teal arrow drawn between step cards, pointing to the next step. */
function CurvedArrow({ flipped }: { flipped?: boolean }) {
  return (
    <svg
      width="46"
      height="48"
      viewBox="0 0 46 48"
      fill="none"
      aria-hidden="true"
      className={flipped ? '-scale-x-100' : undefined}
    >
      <path
        d="M6 2C28 10 40 22 36 42"
        stroke="#51c2cc"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
        fill="none"
      />
      <path
        d="M29 37l7 9 7.5-7"
        stroke="#51c2cc"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
        fill="none"
      />
    </svg>
  )
}

/**
 * Interactive "Klachtenregeling" stepper.
 *
 * Desktop + motion-OK: the section pins to the viewport and each scroll notch
 * snaps to the next step — the card track slides so the active card anchors near
 * the top, the active card turns teal while the rest dim, and the "Stap N" pill
 * tracks the index. Steps are clickable (smooth-scrolls to that step).
 *
 * Mobile or `prefers-reduced-motion`: no pin, no snap — a plain stacked list with
 * the first card highlighted (the server-rendered default), fully accessible.
 */
export function ComplaintsStepper({
  eyebrowIcon,
  eyebrow,
  title,
  intro,
  steps,
  contactCard,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const stRef = useRef<ScrollTrigger | null>(null)
  // Total snap slides = step cards + the optional contact card; lets a clicked
  // step map onto the full slide range (kept in sync inside the matchMedia).
  const slideCountRef = useRef(steps.length)

  // `active` = which card is teal; `stepper` = whether the pinned enhancement is
  // live (drives the dimming of inactive cards + the moving pill). Defaults match
  // the static server render: first card highlighted, nothing dimmed.
  const [active, setActive] = useState(0)
  const [stepper, setStepper] = useState(false)
  const activeRef = useRef(0)

  useGSAP(
    () => {
      if (steps.length < 2) return

      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const cards = cardRefs.current.filter(Boolean) as HTMLElement[]
        const pin = pinRef.current!
        const viewport = viewportRef.current!
        const track = trackRef.current!
        const count = cards.length
        slideCountRef.current = count

        // Enhanced (pinned) presentation — applied imperatively so the static
        // markup stays untouched for no-JS / reduced-motion.
        gsap.set(pin, { minHeight: '100vh' })
        // The active card rests in the opaque centre band; past cards rise into
        // the top fade, upcoming cards emerge from the bottom fade. A wide opaque
        // band leaves room for the last step + contact card to share a slide.
        const fade =
          'linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)'
        gsap.set(viewport, {
          maxHeight: VIEWPORT_MAX,
          overflow: 'hidden',
          maskImage: fade,
          webkitMaskImage: fade,
        })
        setStepper(true)

        // Each card's centre offset within the track and the viewport half-height,
        // recomputed before every refresh so the scrub tween re-reads correct
        // values on resize / font load.
        let center: number[] = []
        let half = 0
        const measure = () => {
          const base = cards[0].offsetTop
          center = cards.map((c) => c.offsetTop - base + c.offsetHeight / 2)
          half = viewport.clientHeight / 2
        }
        measure()

        // One equal-duration segment per gap: this maps each snap point
        // k/(count-1) to card k centred in the viewport, regardless of the cards'
        // differing heights. Function-based y values are re-read on refresh
        // (invalidateOnRefresh) so the alignment survives layout changes.
        const trackTl = gsap.timeline({ defaults: { ease: 'none', duration: 1 } })
        for (let i = 1; i < count; i++) {
          trackTl.fromTo(track, { y: () => half - center[i - 1] }, { y: () => half - center[i] })
        }

        const setActiveFromProgress = (progress: number) => {
          const idx = Math.round(progress * (count - 1))
          if (idx !== activeRef.current) {
            activeRef.current = idx
            setActive(idx)
          }
        }

        const st = ScrollTrigger.create({
          trigger: rootRef.current!,
          start: 'top top',
          end: () => '+=' + (count - 1) * window.innerHeight * STEP_SCROLL,
          pin,
          pinSpacing: true,
          anticipatePin: 1,
          // Scrub couples the slide to the scrollbar (smooth, no jitter); snap
          // then eases the scrollbar to the nearest step once scrolling stops.
          scrub: 0.6,
          animation: trackTl,
          invalidateOnRefresh: true,
          snap: {
            snapTo: 1 / (count - 1),
            // Snap to the NEAREST slide (not projected by scroll velocity), so a
            // slide holds until you deliberately scroll past its halfway point —
            // a flick past the last step no longer flies straight to the contact.
            directional: false,
            duration: { min: 0.25, max: 0.5 },
            delay: 0.08,
            ease: 'power2.inOut',
          },
          onRefreshInit: measure,
          onUpdate: (self) => setActiveFromProgress(self.progress),
        })
        stRef.current = st
        setActiveFromProgress(0)

        return () => {
          stRef.current = null
          gsap.set([pin, viewport, track], { clearProps: 'all' })
          activeRef.current = 0
          setActive(0)
          setStepper(false)
        }
      })

      return () => mm.revert()
    },
    { scope: rootRef, dependencies: [steps.length] },
  )

  const goToStep = (i: number) => {
    const st = stRef.current
    const n = slideCountRef.current
    if (!st || n < 2) return
    // Map the slide index (steps + contact card) onto the pinned scroll range.
    const target = st.start + (i / (n - 1)) * (st.end - st.start)
    gsap.to(window, { scrollTo: target, duration: 0.6, ease: 'power2.inOut' })
  }

  return (
    <div ref={rootRef}>
      <div ref={pinRef} className="lg:flex lg:items-center">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-8">
          {/* Intro column — vertically centred so it lines up with the
              centred active card and the "Stap N" pill. */}
          <div className="flex flex-col items-start gap-6 lg:w-[360px] lg:shrink-0 lg:justify-center xl:w-[420px]">
            <span className="inline-flex items-center gap-2.5 rounded-pill bg-brand/5 px-3 py-2.5 text-brand">
              {eyebrowIcon}
              <span className="text-sm font-medium text-brand">{eyebrow}</span>
            </span>
            <h2 className="font-sans text-3xl font-semibold leading-[1.2] tracking-[0.02em] text-black md:text-[40px]">
              {title}
            </h2>
            <p className="whitespace-pre-line text-sm font-medium text-ink">{intro}</p>
          </div>

          {/* Stepper rail (desktop only): pill centred to sit beside the
              centred active card, line fading above it and below it. */}
          <div className="hidden shrink-0 flex-col items-center lg:flex" aria-hidden="true">
            <div className="w-px flex-1 bg-gradient-to-b from-transparent to-brand/30" />
            <div className="rounded-pill bg-[#e5f6f7] px-4 py-2 text-center text-xl font-bold text-brand">
              {active >= steps.length ? 'Contact' : `Stap ${active + 1}`}
            </div>
            <div className="w-px flex-1 bg-gradient-to-b from-[#eae9e6] to-transparent" />
          </div>

          {/* Step cards */}
          <div ref={viewportRef} className="w-full min-w-0 lg:max-w-[660px] lg:flex-1">
            <div ref={trackRef} className="flex flex-col gap-12 will-change-transform">
              {steps.map((step, i) => {
                const isActive = i === active
                const dimmed = stepper && !isActive
                return (
                  <article
                    key={step.key}
                    ref={(el) => {
                      cardRefs.current[i] = el
                    }}
                    role={stepper ? 'button' : undefined}
                    tabIndex={stepper ? 0 : undefined}
                    aria-current={stepper && isActive ? 'step' : undefined}
                    onClick={stepper ? () => goToStep(i) : undefined}
                    onKeyDown={
                      stepper
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              goToStep(i)
                            }
                          }
                        : undefined
                    }
                    className={`relative rounded-3xl border p-8 outline-none transition-[opacity,background-color] duration-500 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                      stepper ? 'cursor-pointer' : ''
                    } ${
                      isActive
                        ? 'border-[#f4f4f3] bg-brand bg-[linear-gradient(135deg,#7ed6dd_0%,#51c2cc_55%,#3fb0ba_100%)]'
                        : 'border-[#eae9e6] bg-white'
                    } ${dimmed ? 'opacity-40' : 'opacity-100'}`}
                  >
                    <div className="flex flex-col gap-4">
                      <h3
                        className={`text-xl font-bold leading-6 tracking-[-0.01em] ${
                          isActive ? 'text-white' : 'text-brand'
                        }`}
                      >
                        {i + 1}. {step.title}
                      </h3>
                      {step.text && (
                        <p
                          className={`whitespace-pre-line text-sm font-medium leading-5 tracking-[-0.01em] ${
                            isActive ? 'text-white/80' : 'text-black/80'
                          }`}
                        >
                          {step.text}
                        </p>
                      )}
                      {step.pills.map((pill) => (
                        <div
                          key={pill.key}
                          className="flex flex-col items-start rounded-[44px] border border-ink/5 bg-white p-3"
                        >
                          <div className="flex w-full items-start gap-3">
                            <span
                              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-white ${
                                pill.tone === 'danger' ? 'bg-[#f86a6d]' : 'bg-brand'
                              }`}
                            >
                              {pill.icon}
                            </span>
                            <div
                              className={`flex flex-col gap-1 text-sm font-medium leading-5 tracking-[-0.01em] ${
                                pill.tone === 'danger' ? 'text-[#f86a6d]' : 'text-brand'
                              }`}
                            >
                              <span>{pill.text}</span>
                              {pill.note && (
                                <span className="flex gap-1.5 text-black/80">
                                  <span aria-hidden="true">→</span>
                                  {pill.note}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Curved arrow pointing to the next step, alternating
                        sides, sitting in the gap below the card (desktop). */}
                    {i < steps.length - 1 && (
                      <div
                        className={`pointer-events-none absolute top-full z-10 hidden h-12 items-center lg:flex ${
                          i % 2 === 0 ? 'right-16' : 'left-16'
                        }`}
                      >
                        <CurvedArrow flipped={i % 2 === 1} />
                      </div>
                    )}
                  </article>
                )
              })}

              {/* Contact card: the final snap slide (labelled "Contact" on the
                  rail), measured for centring like a step card. */}
              {contactCard && (
                <div
                  ref={(el) => {
                    cardRefs.current[steps.length] = el
                  }}
                >
                  {contactCard}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComplaintsStepper
