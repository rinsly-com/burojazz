import type { CSSProperties } from 'react'

import { MIN_PAN, clampFocal, focalCrop } from './focalCrop'

/**
 * Sizing for the desktop hero photo — the upright image inside the 30°-tilted
 * card. Two regimes, switched at `min-[1920px]` in Hero.tsx:
 *
 * NEAR (viewport < 1920px): only a slice of the tilted card is on screen, so
 * the photo covers just that visible region — from the card's on-screen left
 * edge to the viewport's right edge. This matches the design mock, where both
 * subjects of the photo are visible. Covering the card's full rotated bounding
 * box here (the WIDE rule) would force the photo to be ≥104.56cqw wide while
 * the visible slice is only ~46cqw — showing at most ~44% of the photo, which
 * reads as a heavy zoom no upload or focal point can undo.
 *
 * WIDE (viewport ≥ 1920px): the whole tilted card fits on screen, so the photo
 * must cover its full rotated bounding box or the card's right side would show
 * an empty plane. That coverage is intrinsically more zoomed-in; it is the
 * price of the card being fully visible.
 *
 * All cqw values live on the 1512px design frame (the hero's @container).
 */

/** The card's placement box — its 30°-rotated bounding box (cqw). */
export const DESKTOP_PHOTO_BOX = { width: 104.5635, height: 106.8783 }
/** Where the placement box sits in the composition (cqw). */
const BOX_POS = { left: 54.1005, top: -11.1111 }
/** The card/box centre — the anchor both photo variants are panned from. */
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

/**
 * WIDE variant (≥1920px): cover the card's whole rotated bounding box.
 * `focalCrop` supplies the (focal-demand-driven) zoom and pan, in cqw so the
 * whole composition scales together.
 */
export function widePhotoStyle({ mediaAspect, focalX, focalY }: DesktopPhotoInput): CSSProperties {
  const crop = focalCrop({
    boxAspect: DESKTOP_PHOTO_BOX.width / DESKTOP_PHOTO_BOX.height,
    mediaAspect,
    focalX,
    focalY,
  })
  return {
    width: `${DESKTOP_PHOTO_BOX.width * crop.widthRatio}cqw`,
    height: `${DESKTOP_PHOTO_BOX.height * crop.heightRatio}cqw`,
    // The pan is applied AFTER the counter-rotation, so it runs along the
    // photo's own axes (up/down on screen) rather than the tilted card's.
    transform: [
      'translate(-50%, -50%)',
      'rotate(30deg)',
      `translate(${DESKTOP_PHOTO_BOX.width * crop.offsetXRatio}cqw, ${
        DESKTOP_PHOTO_BOX.height * crop.offsetYRatio
      }cqw)`,
    ].join(' '),
  }
}

/**
 * NEAR variant (<1920px): cover only the visible region of the card —
 * horizontally from the card's on-screen left edge (54.1cqw) to the viewport's
 * right edge, vertically the section's 888px min-height from its top.
 *
 * The region's width depends on the viewport (`(100vw + 100cqw) / 2` is the
 * container-relative x of the viewport's right edge), so the cover math is
 * emitted as CSS calc()/max() instead of resolved numbers. The same focal
 * rules as `focalCrop` apply: pan within the slack, zooming only as far as the
 * focal point's distance from centre demands.
 */
export function nearPhotoStyle({ mediaAspect, focalX, focalY }: DesktopPhotoInput): CSSProperties {
  const a = usableAspect(mediaAspect)
  const kx = (50 - clampFocal(focalX)) / 50
  const ky = (50 - clampFocal(focalY)) / 50
  const zoom = 1 + MIN_PAN * Math.max(Math.abs(kx), Math.abs(ky))

  // Visible-region width: (100vw + 100cqw)/2 - left. Both people in the design
  // photo fit because this is ~46cqw at 1512 instead of the box's 104.56cqw.
  const boxW = `50vw - ${(BOX_POS.left - 50).toFixed(4)}cqw`
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
