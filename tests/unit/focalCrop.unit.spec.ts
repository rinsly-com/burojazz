/**
 * focalCrop (src/lib/focalCrop.ts) — geometry for a focal-point crop that pans
 * on both axes.
 *
 * REGRESSION: the hero used `object-fit: cover` + `object-position: X% Y%`
 * straight from the CMS focal point. Cover overflows exactly one axis, so the
 * other has zero slack and its percentage does nothing. Measured in the browser
 * on the real hero photo (1600x1510) in its box (1581x1616): 131px of
 * horizontal overflow, 0px vertical — moving the focal Y slider in the CMS had
 * no visible effect whatsoever, while X worked. The About image is the same bug
 * mirrored (1365x2048 in 469x632 → 0px horizontal, 72px vertical), so the dead
 * axis depends on the aspect ratios and either one can be the broken one.
 *
 * The assertions below therefore pin BOTH axes as pannable for both
 * orientations. If someone "simplifies" this back to plain cover (minPan 0),
 * the offsets on the exact-fitting axis collapse to 0 and these tests go red.
 */
import { describe, expect, it } from 'vitest'

import { focalCrop } from '../../src/lib/focalCrop'

/** The real hero: landscape-ish photo in a slightly portrait box (Y was dead). */
const HERO = { boxAspect: 1581 / 1616, mediaAspect: 1600 / 1510 }
/** The real About image: portrait photo in a portrait-but-wider box (X was dead). */
const ABOUT = { boxAspect: 469 / 632, mediaAspect: 1365 / 2048 }

describe('the dead-axis regression', () => {
  it('pans vertically for the hero, whose box left cover no vertical slack', () => {
    const top = focalCrop({ ...HERO, focalX: 50, focalY: 0 })
    const bottom = focalCrop({ ...HERO, focalX: 50, focalY: 100 })

    // The bug: both of these were exactly 0.
    expect(top.offsetYRatio).toBeGreaterThan(0)
    expect(bottom.offsetYRatio).toBeLessThan(0)
    // focal 0 shows the top of the photo, so the image shifts DOWN.
    expect(top.offsetYRatio).toBeCloseTo(-bottom.offsetYRatio, 10)
  })

  it('pans horizontally for the About image, whose box left cover no horizontal slack', () => {
    const left = focalCrop({ ...ABOUT, focalX: 0, focalY: 50 })
    const right = focalCrop({ ...ABOUT, focalX: 100, focalY: 50 })

    expect(left.offsetXRatio).toBeGreaterThan(0)
    expect(right.offsetXRatio).toBeLessThan(0)
    expect(left.offsetXRatio).toBeCloseTo(-right.offsetXRatio, 10)
  })

  it.each([
    ['hero', HERO],
    ['About', ABOUT],
  ])('gives %s pan room on both axes at once', (_label, box) => {
    const { widthRatio, heightRatio } = focalCrop({ ...box, focalX: 50, focalY: 50 })
    expect(widthRatio).toBeGreaterThan(1)
    expect(heightRatio).toBeGreaterThan(1)
  })

  it('moves the image proportionally between the extremes', () => {
    const quarter = focalCrop({ ...HERO, focalY: 25 })
    const top = focalCrop({ ...HERO, focalY: 0 })
    expect(quarter.offsetYRatio).toBeCloseTo(top.offsetYRatio / 2, 10)
  })
})

describe('framing invariants', () => {
  it.each([
    ['hero', HERO],
    ['About', ABOUT],
    ['a square box with a panorama', { boxAspect: 1, mediaAspect: 3 }],
    ['a wide box with a tall photo', { boxAspect: 16 / 9, mediaAspect: 0.5 }],
  ])('never lets %s shrink below covering the box', (_label, box) => {
    const crop = focalCrop({ ...box, focalX: 0, focalY: 100 })
    expect(crop.widthRatio).toBeGreaterThanOrEqual(1)
    expect(crop.heightRatio).toBeGreaterThanOrEqual(1)
  })

  // An offset larger than the slack would slide the image off the box and show
  // a background gap at the edge — worse than the crop being slightly off.
  it.each([0, 25, 50, 75, 100])('keeps the box fully covered at focal %i', (focal) => {
    const crop = focalCrop({ ...HERO, focalX: focal, focalY: focal })
    expect(Math.abs(crop.offsetXRatio)).toBeLessThanOrEqual((crop.widthRatio - 1) / 2 + 1e-12)
    expect(Math.abs(crop.offsetYRatio)).toBeLessThanOrEqual((crop.heightRatio - 1) / 2 + 1e-12)
  })

  it.each([
    ['hero', HERO],
    ['About', ABOUT],
    ['a square box with a panorama', { boxAspect: 1, mediaAspect: 3 }],
  ])('never distorts %s — the rendered aspect stays the image aspect', (_label, box) => {
    const { widthRatio, heightRatio } = focalCrop({ ...box, focalX: 10, focalY: 90 })
    // widthRatio is a multiple of the box WIDTH and heightRatio of its HEIGHT,
    // so the rendered aspect is (widthRatio * boxAspect) / heightRatio.
    expect((widthRatio * box.boxAspect) / heightRatio).toBeCloseTo(box.mediaAspect, 10)
  })
})

describe('focal input handling', () => {
  it('centres the image at 50/50', () => {
    const crop = focalCrop({ ...HERO, focalX: 50, focalY: 50 })
    expect(crop.offsetXRatio).toBe(0)
    expect(crop.offsetYRatio).toBe(0)
  })

  it.each([
    ['undefined', undefined],
    ['null', null],
  ])('treats a %s focal point as centred', (_label, value) => {
    const crop = focalCrop({ ...HERO, focalX: value, focalY: value })
    expect(crop.offsetXRatio).toBe(0)
    expect(crop.offsetYRatio).toBe(0)
  })

  it('handles focal 0 without treating it as unset', () => {
    expect(focalCrop({ ...HERO, focalY: 0 }).offsetYRatio).toBeGreaterThan(0)
  })

  it.each([
    ['above 100', 200, 100],
    ['below 0', -50, 0],
  ])('clamps a focal %s to the valid range', (_label, given, equivalent) => {
    expect(focalCrop({ ...HERO, focalY: given }).offsetYRatio).toBeCloseTo(
      focalCrop({ ...HERO, focalY: equivalent }).offsetYRatio,
      10,
    )
  })
})

describe('unusable dimensions', () => {
  // Media docs can lack width/height (SVGs, an interrupted upload). Rendering a
  // centred cover is right; NaN in a style string kills the whole image.
  it.each([
    ['a zero box aspect', { boxAspect: 0, mediaAspect: 1.5 }],
    ['a zero media aspect', { boxAspect: 1.5, mediaAspect: 0 }],
    ['a NaN media aspect', { boxAspect: 1.5, mediaAspect: Number.NaN }],
    ['an infinite box aspect', { boxAspect: Number.POSITIVE_INFINITY, mediaAspect: 1.5 }],
  ])('falls back to a centred cover for %s', (_label, box) => {
    expect(focalCrop({ ...box, focalX: 0, focalY: 100 })).toEqual({
      widthRatio: 1,
      heightRatio: 1,
      offsetXRatio: 0,
      offsetYRatio: 0,
    })
  })

  it('returns finite numbers for every field', () => {
    const crop = focalCrop({ ...HERO, focalX: 0, focalY: 100 })
    for (const value of Object.values(crop)) expect(Number.isFinite(value)).toBe(true)
  })
})
