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
  /** Optional "Nog vragen?" card, pre-rendered on the server. Rendered as the
   *  final card, so it becomes active ("Contact") after the last step. */
  contactCard?: ReactNode
}

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
 * Desktop + motion-OK: the left column (intro + "Stap N" rail) is sticky and
 * vertically centred while the section is in view; the cards scroll past it in
 * normal document flow. A per-card ScrollTrigger flips the active/highlight + step
 * number as each card reaches the viewport centre. After the last card the section
 * ends, the sticky column releases, and scrolling is normal again. Steps are
 * clickable (smooth-scrolls that card to centre).
 *
 * Mobile or `prefers-reduced-motion`: no sticky, no scroll-tracking — a plain
 * stacked list with the first card highlighted (the server-rendered default).
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
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const activeRef = useRef(0)

  // `active` = which card is highlighted; `stepper` = whether the sticky-scroll
  // enhancement is live (drives the sticky columns + dimming). Defaults match the
  // static server render: first card highlighted, nothing sticky/dimmed.
  const [active, setActive] = useState(0)
  const [stepper, setStepper] = useState(false)

  useGSAP(
    () => {
      if (steps.length < 2) return

      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        setStepper(true)

        const setActiveIndex = (i: number) => {
          if (i !== activeRef.current) {
            activeRef.current = i
            setActive(i)
          }
        }

        // On every scroll frame, highlight whichever card's CENTRE is nearest the
        // viewport centre. Read the refs FRESH each call: enabling stepper mode
        // swaps the cards from <article> to <div>, so any array captured once would
        // point at detached elements (all measuring 0 → always card 0 → no change).
        const updateActive = () => {
          const mid = window.innerHeight / 2
          const refs = cardRefs.current
          let best = -1
          let bestDist = Infinity
          for (let i = 0; i < refs.length; i++) {
            const el = refs[i]
            if (!el) continue
            const r = el.getBoundingClientRect()
            const dist = Math.abs(r.top + r.height / 2 - mid)
            if (dist < bestDist) {
              bestDist = dist
              best = i
            }
          }
          if (best >= 0) setActiveIndex(best)
        }

        const st = ScrollTrigger.create({
          trigger: rootRef.current!,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: updateActive,
          onRefresh: updateActive,
        })

        // Settle the sticky layout, then pick the initial active card.
        requestAnimationFrame(() => {
          ScrollTrigger.refresh()
          updateActive()
        })

        return () => {
          st.kill()
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
    const card = cardRefs.current[i]
    if (!card) return
    // Scroll so this card's centre lands at the viewport centre.
    const rect = card.getBoundingClientRect()
    const target = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2
    gsap.to(window, { scrollTo: { y: target, autoKill: true }, duration: 0.6, ease: 'power2.inOut' })
  }

  // The sticky columns are only sticky in enhanced (desktop + motion) mode.
  const stickyCol = stepper ? 'lg:sticky lg:top-0 lg:h-screen lg:justify-center' : ''

  return (
    <div ref={rootRef}>
      <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-8">
        {/* Intro column — sticky + vertically centred while the cards scroll. */}
        <div
          className={`flex flex-col items-start gap-6 lg:w-[360px] lg:shrink-0 xl:w-[420px] ${stickyCol}`}
        >
          <span className="inline-flex items-center gap-2.5 rounded-pill bg-brand/5 px-3 py-2.5 text-brand">
            {eyebrowIcon}
            <span className="text-sm font-medium text-brand">{eyebrow}</span>
          </span>
          <h2 className="font-sans text-3xl font-semibold leading-[1.2] tracking-[0.02em] text-black md:text-[40px]">
            {title}
          </h2>
          <p className="whitespace-pre-line text-sm font-medium text-ink">{intro}</p>
        </div>

        {/* Stepper rail (desktop only): pill centred beside the active card. */}
        <div
          className={`hidden shrink-0 flex-col items-center lg:flex ${stickyCol}`}
          aria-hidden="true"
        >
          <div className="w-px flex-1 bg-gradient-to-b from-transparent to-brand/30" />
          <div className="rounded-pill bg-[#e5f6f7] px-4 py-2 text-center text-xl font-bold text-brand">
            {`Stap ${active + 1}`}
          </div>
          <div className="w-px flex-1 bg-gradient-to-b from-[#eae9e6] to-transparent" />
        </div>

        {/* Step cards — normal document flow. The vertical padding (enhanced mode)
            lets the first and last cards reach the viewport centre. */}
        <div className="w-full min-w-0 lg:max-w-[660px] lg:flex-1">
          <div className={`flex flex-col gap-12 ${stepper ? 'lg:pt-[40vh] lg:pb-[30vh]' : ''}`}>
            {steps.map((step, i) => {
              const isActive = i === active
              const dimmed = stepper && !isActive
              // In stepper mode the card is an interactive control, so render a
              // generic <div role="button"> — putting role="button" on <article>
              // overrides its implicit article role, which malforms the a11y
              // tree (fails Lighthouse's agentic-browsing audit). Static mode
              // keeps the <article> semantics.
              const Card = stepper ? 'div' : 'article'
              return (
                <Card
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
                        <div className="flex w-full items-center gap-3">
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
                </Card>
              )
            })}

            {/* "Nog vragen?" card — part of the last step: rendered right after the
                step cards but NOT a tracked step, so the pill stays on the last
                "Stap N" as it scrolls in with (just below) the final card. */}
            {contactCard && <div>{contactCard}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComplaintsStepper
