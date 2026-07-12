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
}

/** Vertical fraction of the card viewport per scroll step (also the pin length). */
const STEP_SCROLL = 0.85
/** Card viewport height while pinned; leaves room for a peek of the next card. */
const VIEWPORT_MAX = '78vh'

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
export function ComplaintsStepper({ eyebrowIcon, eyebrow, title, intro, steps }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const stRef = useRef<ScrollTrigger | null>(null)

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

        // Enhanced (pinned) presentation — applied imperatively so the static
        // markup stays untouched for no-JS / reduced-motion.
        gsap.set(pin, { minHeight: '100vh' })
        gsap.set(viewport, {
          maxHeight: VIEWPORT_MAX,
          overflow: 'hidden',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 10%, black 82%, transparent 100%)',
        })
        setStepper(true)

        // Offsets of each card top within the track (recomputed on refresh).
        let rel: number[] = []
        const measure = () => {
          const base = cards[0].offsetTop
          rel = cards.map((c) => c.offsetTop - base)
        }
        measure()

        const applyProgress = (progress: number) => {
          const s = progress * (count - 1)
          const lo = Math.floor(s)
          const hi = Math.min(lo + 1, count - 1)
          const f = s - lo
          const y = -(rel[lo] + (rel[hi] - rel[lo]) * f)
          gsap.set(track, { y })
          const idx = Math.round(s)
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
          invalidateOnRefresh: true,
          snap: {
            snapTo: 1 / (count - 1),
            duration: { min: 0.2, max: 0.5 },
            ease: 'power1.inOut',
          },
          onRefresh: () => {
            measure()
            applyProgress(stRef.current?.progress ?? 0)
          },
          onUpdate: (self) => applyProgress(self.progress),
        })
        stRef.current = st
        applyProgress(0)

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
    if (!st || steps.length < 2) return
    const target = st.start + (i / (steps.length - 1)) * (st.end - st.start)
    gsap.to(window, { scrollTo: target, duration: 0.6, ease: 'power2.inOut' })
  }

  return (
    <div ref={rootRef}>
      <div ref={pinRef} className="lg:flex lg:items-center">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-8">
          {/* Intro column */}
          <div className="flex flex-col items-start gap-6 lg:w-[360px] lg:shrink-0 xl:w-[420px]">
            <span className="inline-flex items-center gap-2.5 rounded-pill bg-brand/5 px-3 py-2.5 text-brand">
              {eyebrowIcon}
              <span className="text-sm font-medium text-brand">{eyebrow}</span>
            </span>
            <h2 className="font-sans text-3xl font-semibold leading-[1.2] tracking-[0.02em] text-black md:text-[40px]">
              {title}
            </h2>
            <p className="whitespace-pre-line text-sm font-medium text-ink">{intro}</p>
          </div>

          {/* Stepper rail (desktop only) */}
          <div className="hidden shrink-0 flex-col items-center lg:flex" aria-hidden="true">
            <div className="h-[82px] w-px bg-brand/30" />
            <div className="rounded-pill bg-[#e5f6f7] px-4 py-2 text-center text-xl font-bold text-brand">
              Stap {active + 1}
            </div>
            <div className="w-px flex-1 bg-[#eae9e6]" />
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
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComplaintsStepper
