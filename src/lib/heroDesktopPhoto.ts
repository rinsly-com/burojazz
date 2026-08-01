import type { CSSProperties } from 'react'

import { MIN_PAN, clampFocal } from './focalCrop'

/**
 * Sizing for the desktop hero photo — the upright image inside the 30°-tilted
 * card. The photo covers the card's VISIBLE region: horizontally from the
 * card's on-screen left edge to the viewport's right edge — capped at the
 * card's own right edge — and vertically the section's 888px min-height.
 *
 * That one rule spans every viewport smoothly:
 * - ~1512px: the region is ~46cqw wide, so the photo renders small enough to
 *   show the design framing (both subjects in view). Covering the card's full
 *   rotated bounding box instead (104.56cqw) would cap the visible share of
 *   the photo at ~44% of its width — a heavy zoom no upload, crop, or focal
 *   point could undo.
 * - 1512px → ~3286px: the region's right edge follows the viewport, so the
 *   photo grows linearly (½px per viewport px) — no breakpoint, no snap.
 * - ≥ ~3286px: the region has reached the card's right edge (158.66cqw) and
 *   the photo has converged to exactly full-card coverage; the whole tilted
 *   card is on screen and stays covered. (The card's rightmost tip sits at
 *   y≈886, just inside the 888px region; its lower half is clipped by the
 *   section's overflow.)
 *
 * The region's width depends on the viewport, so the cover math is emitted as
 * CSS calc()/min()/max() instead of resolved numbers. The same focal rules as
 * `focalCrop` apply: pan within the slack, zooming only as far as the focal
 * point's distance from centre demands.
 *
 * All cqw values live on the 1512px design frame (the hero's @container).
 */

/** The card's placement box — its 30°-rotated bounding box (cqw). */
export const DESKTOP_PHOTO_BOX = { width: 104.5635, height: 106.8783 }
/** Where the placement box sits in the composition (cqw). */
const BOX_POS = { left: 54.1005, top: -11.1111 }
/** The card/box centre — the anchor the photo is panned from. */
const BOX_CENTER = {
  x: BOX_POS.left + DESKTOP_PHOTO_BOX.width / 2,
  y: BOX_POS.top + DESKTOP_PHOTO_BOX.height / 2,
}
/** The hero section's xl min-height (px) — the visible region's bottom edge. */
const SECTION_MIN_H = 888
/** Aspect of the bundled fallback photo (photo-2.jpg, 1600x1510), used when the
 * CMS media has no usable dimensions. */
const DEFAULT_ASPECT = 1600 / 1510

export type DesktopPhotoInput = {
  /** The image's intrinsic width / height. */
  mediaAspect: number
  /** Payload's focal point, 0–100; absent means centred. */
  focalX?: number | null
  focalY?: number | null
}

const usableAspect = (a: number) => (Number.isFinite(a) && a > 0 ? a : DEFAULT_ASPECT)

export function desktopPhotoStyle({ mediaAspect, focalX, focalY }: DesktopPhotoInput): CSSProperties {
  const a = usableAspect(mediaAspect)
  const kx = (50 - clampFocal(focalX)) / 50
  const ky = (50 - clampFocal(focalY)) / 50
  const zoom = 1 + MIN_PAN * Math.max(Math.abs(kx), Math.abs(ky))

  // Visible-region width: from the card's left edge to the viewport's right
  // edge — (100vw + 100cqw)/2 in container coordinates — capped at the card's
  // right edge. The cap is what makes ultrawide seamless: the region tracks
  // the viewport until it spans the whole card, converging on full coverage.
  const boxW = `min(50vw - ${(BOX_POS.left - 50).toFixed(4)}cqw, ${DESKTOP_PHOTO_BOX.width}cqw)`
  // Cover: wide enough for the region, tall enough for the section.
  const coverW = `max(${boxW}, ${(SECTION_MIN_H * a).toFixed(2)}px)`

  // Photo centre = region centre + focal offset; the pan translates from the
  // card centre (the img's anchor) to there, along the photo's upright axes.
  //   panX = (left - centreX) + regionW·(1-kx)/2 + photoW·kx/2
  //   panY = sectionH·(1-ky)/2 - centreY + photoH·ky/2
  // |k| ≤ 1 keeps the offset inside the slack, so the region stays covered.
  const panX = [
    `${(BOX_POS.left - BOX_CENTER.x).toFixed(4)}cqw`,
    `+ (${boxW}) * ${((1 - kx) / 2).toFixed(6)}`,
    `+ ${coverW} * ${((zoom * kx) / 2).toFixed(6)}`,
  ].join(' ')
  const panY = [
    `${((SECTION_MIN_H * (1 - ky)) / 2).toFixed(2)}px`,
    `- ${BOX_CENTER.y.toFixed(4)}cqw`,
    `+ ${coverW} * ${((zoom * ky) / 2 / a).toFixed(6)}`,
  ].join(' ')

  return {
    width: `calc(${coverW} * ${zoom})`,
    height: `calc(${coverW} * ${(zoom / a).toFixed(6)})`,
    transform: `translate(-50%, -50%) rotate(30deg) translate(calc(${panX}), calc(${panY}))`,
  }
}
