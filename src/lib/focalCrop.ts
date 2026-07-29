/**
 * Focal-point cropping that can pan on BOTH axes.
 *
 * `object-fit: cover` + `object-position` only pans along the axis where the
 * scaled image overflows its box — and cover, by definition, overflows exactly
 * ONE axis (whichever aspect ratio is "too big"). The other axis fits exactly,
 * has zero slack, and its focal percentage is silently a no-op.
 *
 * Measured on the hero: a 1600x1510 photo in its 1581x1616 box overflows
 * 131px horizontally and 0px vertically, so the CMS focal X control worked and
 * focal Y did nothing at all. The About image is the same bug mirrored (0px
 * horizontal, 72px vertical) — there focal X is the dead one.
 *
 * The fix is to zoom past the minimal cover so both axes have room to move,
 * then offset the image by the focal point ourselves instead of leaning on
 * `object-position`. Extra zoom is unavoidable — panning needs overflow, and
 * preserving the image's aspect ratio means both axes zoom together — but it
 * is only taken when the focal point actually asks for it: each axis wants
 * slack in proportion to how far its focal is from centre, so a centred focal
 * point renders an exact, unzoomed cover.
 *
 * All results are ratios relative to the box, so the same numbers drive a
 * fixed-px box (the desktop hero frame) and a fluid one (the mobile photo).
 */

/**
 * The MAXIMUM extra zoom, as a fraction of the box, reached only when a focal
 * axis is pushed all the way to an edge (0 or 100). A centred focal takes no
 * extra zoom at all; in between the zoom grows linearly with the focal's
 * distance from centre. 0.2 means an edge focal shows up to 20% less of the
 * photo. Raise for more framing freedom, lower to keep more of the image
 * visible.
 */
const MIN_PAN = 0.2

export type FocalCropInput = {
  /** The visible window's width / height. */
  boxAspect: number
  /** The image's intrinsic width / height. */
  mediaAspect: number
  /** Payload's focal point, 0–100. 50 is centred; defaults to centre. */
  focalX?: number | null
  focalY?: number | null
  /** Override the default pan room (see MIN_PAN). */
  minPan?: number
}

export type FocalCrop = {
  /** Image width as a multiple of the box width (1 = exactly the box). */
  widthRatio: number
  /** Image height as a multiple of the box height. */
  heightRatio: number
  /** Offset from centre as a fraction of the box. Positive moves right/down. */
  offsetXRatio: number
  offsetYRatio: number
}

/** Centred, exactly-covering fallback for unusable input (missing dimensions). */
const CENTRED: FocalCrop = { widthRatio: 1, heightRatio: 1, offsetXRatio: 0, offsetYRatio: 0 }

const usable = (n: number) => Number.isFinite(n) && n > 0

/**
 * Payload allows any number in the focal fields; keep it inside 0–100. Only an
 * absent value means "centre" — 0 is a real edge, and a negative number is a
 * bad 0 rather than a missing value. (`Number(null)` is 0, hence the explicit
 * null check.)
 */
const clampFocal = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 50
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 50
}

export function focalCrop({
  boxAspect,
  mediaAspect,
  focalX,
  focalY,
  minPan = MIN_PAN,
}: FocalCropInput): FocalCrop {
  if (!usable(boxAspect) || !usable(mediaAspect)) return CENTRED

  // Minimal cover, expressed as a multiple of the box on each axis: the wider
  // relative aspect overflows, the other fits exactly (ratio 1).
  let widthRatio = mediaAspect >= boxAspect ? mediaAspect / boxAspect : 1
  let heightRatio = mediaAspect >= boxAspect ? 1 : boxAspect / mediaAspect

  // Zoom past cover only as far as the focal point actually needs: each axis
  // wants pan room in proportion to how far its focal sits from centre, so a
  // centred focal point keeps the exact cover and takes no zoom at all. One
  // scale for both axes, so the image never distorts.
  const pan = Math.max(0, minPan)
  const deviationX = Math.abs(50 - clampFocal(focalX)) / 50
  const deviationY = Math.abs(50 - clampFocal(focalY)) / 50
  const zoom = Math.max(
    1,
    (1 + pan * deviationX) / widthRatio,
    (1 + pan * deviationY) / heightRatio,
  )
  widthRatio *= zoom
  heightRatio *= zoom

  // Map the focal point onto the slack. focal 0 shows the top/left edge, which
  // means shifting the image down/right by the full half-slack; focal 100 the
  // opposite. Because |50 - focal| <= 50, the offset can never exceed the
  // slack, so a gap at the edge of the box is impossible.
  const offsetXRatio = ((widthRatio - 1) / 2) * ((50 - clampFocal(focalX)) / 50)
  const offsetYRatio = ((heightRatio - 1) / 2) * ((50 - clampFocal(focalY)) / 50)

  return { widthRatio, heightRatio, offsetXRatio, offsetYRatio }
}
