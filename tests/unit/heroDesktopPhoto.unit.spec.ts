/**
 * heroDesktopPhoto (src/lib/heroDesktopPhoto.ts) — the two sizing regimes for
 * the desktop hero photo.
 *
 * REGRESSION (the "still very zoomed" hero): the photo always covered the
 * tilted card's full 30°-rotated bounding box (104.56x106.88cqw). At a 1512px
 * viewport only a ~46cqw slice of that card is on screen, so at most ~44% of
 * the photo's width was ever visible — the design mock's framing (both
 * subjects of the boxing photo in view) was mathematically impossible for ANY
 * upload, crop, or focal point. The fix covers only the visible region below
 * 1920px (`nearPhotoStyle`) and keeps full-box coverage from 1920px up
 * (`widePhotoStyle`), where the whole card actually fits on screen.
 *
 * The near variant emits CSS calc()/max() because the visible region depends
 * on the viewport. The evaluator below resolves those strings numerically so
 * the assertions run against the real emitted CSS, not a re-derivation.
 */
import { describe, expect, it } from 'vitest'

import { focalCrop } from '../../src/lib/focalCrop'
import { DESKTOP_PHOTO_BOX, nearPhotoStyle, widePhotoStyle } from '../../src/lib/heroDesktopPhoto'

/** The hero image currently in the CMS (1967x1857) — near-square. */
const HERO_ASPECT = 1967 / 1857
/** The card's placement box's left edge / the section min-height (design). */
const BOX_LEFT_CQW = 54.1005
const SECTION_H = 888

type Env = { vw: number; container: number }
const cqw = (env: Env) => env.container / 100

/** Resolve a CSS calc()/max() expression to px for a given viewport. */
const evalCss = (expr: string, env: Env): number => {
  const js = expr
    .replaceAll(/\bcalc\(/g, '(')
    .replaceAll(/\bmax\(/g, 'Math.max(')
    .replace(/(-?\d*\.?\d+)vw/g, (_, n) => `(${n}*${env.vw / 100})`)
    .replace(/(-?\d*\.?\d+)cqw/g, (_, n) => `(${n}*${cqw(env)})`)
    .replace(/(-?\d*\.?\d+)px/g, '($1)')
  return new Function(`"use strict"; return (${js})`)() as number
}

/** Evaluate a near-variant style into the photo's box in container px. */
const nearGeometry = (
  style: ReturnType<typeof nearPhotoStyle>,
  env: Env,
): { left: number; right: number; top: number; bottom: number; width: number } => {
  const width = evalCss(String(style.width), env)
  const height = evalCss(String(style.height), env)
  // Split on the `), calc(` boundary — the pan expressions contain commas
  // (inside max()), so a naive `(.+), (.+)` match would cut the wrong one.
  const m = String(style.transform).match(/rotate\(30deg\) translate\(calc\((.+)\), calc\((.+)\)\)$/)
  if (!m) throw new Error(`unexpected transform: ${style.transform}`)
  // The pan runs along the upright axes from the card centre (the img anchor).
  const centerX = (BOX_LEFT_CQW + DESKTOP_PHOTO_BOX.width / 2) * cqw(env) + evalCss(m[1], env)
  const centerY = (-11.1111 + DESKTOP_PHOTO_BOX.height / 2) * cqw(env) + evalCss(m[2], env)
  return {
    left: centerX - width / 2,
    right: centerX + width / 2,
    top: centerY - height / 2,
    bottom: centerY + height / 2,
    width,
  }
}

/** The visible region the near variant must cover, in container px. */
const visibleRegion = (env: Env) => ({
  left: BOX_LEFT_CQW * cqw(env),
  right: (env.vw + env.container) / 2,
  top: 0,
  bottom: SECTION_H,
})

const ENVS: Env[] = [
  { vw: 1280, container: 1280 },
  { vw: 1366, container: 1366 },
  { vw: 1512, container: 1512 },
  { vw: 1919, container: 1512 },
]

describe('the full-box-zoom regression (near variant, <1920px)', () => {
  it('renders the design photo small enough to show both subjects at 1512px', () => {
    const env = { vw: 1512, container: 1512 }
    const geo = nearGeometry(nearPhotoStyle({ mediaAspect: HERO_ASPECT }), env)
    // The bug: full-box coverage forced ≥ 104.56cqw ≈ 1581px (rendered 1712px
    // for this aspect). The visible-region cover is section-height-driven:
    // 888px tall → ~941px wide, so the on-screen slice shows ~74% of the
    // photo's width instead of ~41%.
    expect(geo.width).toBeLessThan(1000)
    expect(geo.width).toBeCloseTo(SECTION_H * HERO_ASPECT, 0)
  })

  it.each(ENVS.map((env) => [`${env.vw}px viewport`, env] as const))(
    'covers the visible region at %s for every focal corner',
    (_label, env) => {
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
          const geo = nearGeometry(nearPhotoStyle({ mediaAspect, ...focal }), env)
          const region = visibleRegion(env)
          const label = `aspect ${mediaAspect.toFixed(2)} focal ${JSON.stringify(focal)} @${env.vw}`
          expect(geo.left, label).toBeLessThanOrEqual(region.left + 0.01)
          expect(geo.right, label).toBeGreaterThanOrEqual(region.right - 0.01)
          expect(geo.top, label).toBeLessThanOrEqual(region.top + 0.01)
          expect(geo.bottom, label).toBeGreaterThanOrEqual(region.bottom - 0.01)
        }
      }
    },
  )

  it('pans towards the focal point without ever uncovering the region', () => {
    const env = { vw: 1512, container: 1512 }
    const left = nearGeometry(nearPhotoStyle({ mediaAspect: HERO_ASPECT, focalX: 0 }), env)
    const right = nearGeometry(nearPhotoStyle({ mediaAspect: HERO_ASPECT, focalX: 100 }), env)
    // focal 0 shows the photo's left edge: the image sits further right.
    expect(left.left).toBeGreaterThan(right.left)
  })

  it('takes no extra zoom for a centred focal point', () => {
    const env = { vw: 1512, container: 1512 }
    const centred = nearGeometry(nearPhotoStyle({ mediaAspect: HERO_ASPECT, focalX: 50, focalY: 50 }), env)
    const edge = nearGeometry(nearPhotoStyle({ mediaAspect: HERO_ASPECT, focalX: 50, focalY: 0 }), env)
    expect(centred.width).toBeLessThan(edge.width)
    expect(centred.width).toBeCloseTo(SECTION_H * HERO_ASPECT, 0)
  })

  it('falls back to the bundled photo aspect when media has no dimensions', () => {
    const env = { vw: 1512, container: 1512 }
    const geo = nearGeometry(nearPhotoStyle({ mediaAspect: Number.NaN }), env)
    expect(geo.width).toBeCloseTo(SECTION_H * (1600 / 1510), 0)
  })
})

describe('the wide variant (≥1920px)', () => {
  it("still covers the card's full rotated bounding box via focalCrop", () => {
    const style = widePhotoStyle({ mediaAspect: HERO_ASPECT, focalX: 50, focalY: 50 })
    const crop = focalCrop({
      boxAspect: DESKTOP_PHOTO_BOX.width / DESKTOP_PHOTO_BOX.height,
      mediaAspect: HERO_ASPECT,
      focalX: 50,
      focalY: 50,
    })
    expect(style.width).toBe(`${DESKTOP_PHOTO_BOX.width * crop.widthRatio}cqw`)
    expect(style.height).toBe(`${DESKTOP_PHOTO_BOX.height * crop.heightRatio}cqw`)
    expect(String(style.transform)).toContain('rotate(30deg)')
  })
})
