/**
 * heroDesktopPhoto (src/lib/heroDesktopPhoto.ts) — the desktop hero photo's
 * visible-region cover.
 *
 * REGRESSION 1 (the "still very zoomed" hero): the photo always covered the
 * tilted card's full 30°-rotated bounding box (104.56x106.88cqw). At a 1512px
 * viewport only a ~46cqw slice of that card is on screen, so at most ~44% of
 * the photo's width was ever visible — the design mock's framing (both
 * subjects of the boxing photo in view) was mathematically impossible for ANY
 * upload, crop, or focal point.
 *
 * REGRESSION 2 (the 1920px snap): the first fix split the sizing into two
 * variants switched at min-[1920px]; crossing 1919→1921px snapped the photo
 * from ~940px to ~1712px wide. The cover now caps the visible region at the
 * card's own right edge instead, so one formula grows linearly with the
 * viewport and converges on full-card coverage at ~3286px — no breakpoint.
 *
 * The style is emitted as CSS calc()/min()/max() because the region depends
 * on the viewport. The evaluator below resolves those strings numerically so
 * the assertions run against the real emitted CSS, not a re-derivation.
 */
import { describe, expect, it } from 'vitest'

import { DESKTOP_PHOTO_BOX, desktopPhotoStyle } from '../../src/lib/heroDesktopPhoto'

/** The hero image currently in the CMS (1967x1857) — near-square. */
const HERO_ASPECT = 1967 / 1857
/** The card's placement box's left edge / the section min-height (design). */
const BOX_LEFT_CQW = 54.1005
const SECTION_H = 888

type Env = { vw: number; container: number }
const env = (vw: number): Env => ({ vw, container: Math.min(vw, 1512) })
const cqw = (e: Env) => e.container / 100

/** Resolve a CSS calc()/min()/max() expression to px for a given viewport. */
const evalCss = (expr: string, e: Env): number => {
  const js = expr
    .replaceAll(/\bcalc\(/g, '(')
    .replaceAll(/\bmax\(/g, 'Math.max(')
    .replaceAll(/\bmin\(/g, 'Math.min(')
    .replace(/(-?\d*\.?\d+)vw/g, (_, n) => `(${n}*${e.vw / 100})`)
    .replace(/(-?\d*\.?\d+)cqw/g, (_, n) => `(${n}*${cqw(e)})`)
    .replace(/(-?\d*\.?\d+)px/g, '($1)')
  return new Function(`"use strict"; return (${js})`)() as number
}

/** Evaluate a style into the photo's box in container px. */
const geometry = (
  style: ReturnType<typeof desktopPhotoStyle>,
  e: Env,
): { left: number; right: number; top: number; bottom: number; width: number } => {
  const width = evalCss(String(style.width), e)
  const height = evalCss(String(style.height), e)
  // Split on the `), calc(` boundary — the pan expressions contain commas
  // (inside min()/max()), so a naive `(.+), (.+)` match would cut the wrong one.
  const m = String(style.transform).match(/rotate\(30deg\) translate\(calc\((.+)\), calc\((.+)\)\)$/)
  if (!m) throw new Error(`unexpected transform: ${style.transform}`)
  // The pan runs along the upright axes from the card centre (the img anchor).
  const centerX = (BOX_LEFT_CQW + DESKTOP_PHOTO_BOX.width / 2) * cqw(e) + evalCss(m[1], e)
  const centerY = (-11.1111 + DESKTOP_PHOTO_BOX.height / 2) * cqw(e) + evalCss(m[2], e)
  return {
    left: centerX - width / 2,
    right: centerX + width / 2,
    top: centerY - height / 2,
    bottom: centerY + height / 2,
    width,
  }
}

/** The visible region the photo must cover, in container px: from the card's
 * left edge to the viewport's right edge, capped at the card's right edge. */
const visibleRegion = (e: Env) => ({
  left: BOX_LEFT_CQW * cqw(e),
  right: Math.min((e.vw + e.container) / 2, (BOX_LEFT_CQW + DESKTOP_PHOTO_BOX.width) * cqw(e)),
  top: 0,
  bottom: SECTION_H,
})

const VIEWPORTS = [1280, 1366, 1512, 1919, 1921, 2560, 3286, 5120]

describe('the full-box-zoom regression', () => {
  it('renders the design photo small enough to show both subjects at 1512px', () => {
    const geo = geometry(desktopPhotoStyle({ mediaAspect: HERO_ASPECT }), env(1512))
    // The bug: full-box coverage forced ≥ 104.56cqw ≈ 1581px (rendered 1712px
    // for this aspect). The visible-region cover is section-height-driven:
    // 888px tall → ~941px wide, so the on-screen slice shows ~74% of the
    // photo's width instead of ~41%.
    expect(geo.width).toBeLessThan(1000)
    expect(geo.width).toBeCloseTo(SECTION_H * HERO_ASPECT, 0)
  })

  it.each(VIEWPORTS.map((vw) => [`${vw}px viewport`, env(vw)] as const))(
    'covers the visible region at %s for every focal corner',
    (_label, e) => {
      const focals = [
        { focalX: 50, focalY: 50 },
        { focalX: 0, focalY: 0 },
        { focalX: 100, focalY: 100 },
        { focalX: 0, focalY: 100 },
        {},
      ]
      const aspects = [HERO_ASPECT, 1600 / 1510, 3, 0.6]
      for (const focal of focals) {
        for (const mediaAspect of aspects) {
          const geo = geometry(desktopPhotoStyle({ mediaAspect, ...focal }), e)
          const region = visibleRegion(e)
          const label = `aspect ${mediaAspect.toFixed(2)} focal ${JSON.stringify(focal)} @${e.vw}`
          expect(geo.left, label).toBeLessThanOrEqual(region.left + 0.01)
          expect(geo.right, label).toBeGreaterThanOrEqual(region.right - 0.01)
          expect(geo.top, label).toBeLessThanOrEqual(region.top + 0.01)
          expect(geo.bottom, label).toBeGreaterThanOrEqual(region.bottom - 0.01)
        }
      }
    },
  )

  it('pans towards the focal point without ever uncovering the region', () => {
    const left = geometry(desktopPhotoStyle({ mediaAspect: HERO_ASPECT, focalX: 0 }), env(1512))
    const right = geometry(desktopPhotoStyle({ mediaAspect: HERO_ASPECT, focalX: 100 }), env(1512))
    // focal 0 shows the photo's left edge: the image sits further right.
    expect(left.left).toBeGreaterThan(right.left)
  })

  it('takes no extra zoom for a centred focal point', () => {
    const centred = geometry(
      desktopPhotoStyle({ mediaAspect: HERO_ASPECT, focalX: 50, focalY: 50 }),
      env(1512),
    )
    const edge = geometry(
      desktopPhotoStyle({ mediaAspect: HERO_ASPECT, focalX: 50, focalY: 0 }),
      env(1512),
    )
    expect(centred.width).toBeLessThan(edge.width)
    expect(centred.width).toBeCloseTo(SECTION_H * HERO_ASPECT, 0)
  })

  it('falls back to the bundled photo aspect when media has no dimensions', () => {
    const geo = geometry(desktopPhotoStyle({ mediaAspect: Number.NaN }), env(1512))
    expect(geo.width).toBeCloseTo(SECTION_H * (1600 / 1510), 0)
  })
})

describe('the 1920px-snap regression', () => {
  const width = (vw: number) =>
    geometry(desktopPhotoStyle({ mediaAspect: HERO_ASPECT, focalX: 50, focalY: 50 }), env(vw)).width

  it('grows continuously across viewport widths — no jump anywhere', () => {
    // The bug: two variants switched at min-[1920px] snapped the photo from
    // ~940px to ~1712px wide between 1919 and 1921px viewports.
    for (let vw = 1300; vw <= 3400; vw += 2) {
      const step = width(vw + 2) - width(vw)
      expect(step, `step at ${vw}px`).toBeGreaterThanOrEqual(0)
      // The region's right edge moves at vw/2, so the photo may grow at most
      // ~1px per viewport px (plus rounding).
      expect(step, `step at ${vw}px`).toBeLessThanOrEqual(1.1)
    }
  })

  it('converges on exactly full-card coverage once the whole card is on screen', () => {
    // The region right edge reaches the card's right edge (158.664cqw) at
    // vw = 2·(158.664 - 50)·15.12 ≈ 3286px; beyond that the size is constant.
    const atCap = width(3290)
    expect(atCap).toBeCloseTo(DESKTOP_PHOTO_BOX.width * 15.12, 0)
    expect(width(5120)).toBeCloseTo(atCap, 5)
  })

  it('keeps the design framing well past 1920px', () => {
    // Halfway through the ease the photo is still far from full-card size.
    expect(width(1921)).toBeLessThan(1000)
    expect(width(2560)).toBeLessThan(1300)
  })
})
