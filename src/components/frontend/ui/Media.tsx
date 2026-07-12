import type { CSSProperties } from 'react'

import type { Media as MediaDoc } from '@/payload-types'

/** An upload field value: a populated Media doc (depth ≥ 1), an id, or empty. */
export type MediaResource = number | MediaDoc | null | undefined

/** Narrow an upload field to its populated Media doc, else null. */
export function resolveMedia(resource: MediaResource): MediaDoc | null {
  return resource && typeof resource === 'object' ? resource : null
}

/** Resolve an upload field directly to its URL (depth ≥ 1), else null. */
export function mediaUrl(resource: MediaResource): string | null {
  return resolveMedia(resource)?.url ?? null
}

type MediaProps = {
  /** The upload field value (Media doc, id, or null). */
  resource: MediaResource
  /** Overrides the doc's `alt`. Pass "" for decorative images. */
  alt?: string
  /** Classes for the <img> box (sizing/position). Do NOT set object-fit here. */
  className?: string
  /** How the image fills its box. Defaults to "cover". */
  fit?: 'cover' | 'contain'
  style?: CSSProperties
}

/**
 * Renders a CMS media upload as an <img>, applying the doc's focal point as
 * CSS `object-position`. Because the crop is done by the browser (object-fit +
 * object-position), focal-point framing works everywhere — local dev, the accp
 * Worker, and the static production export — with no server-side image
 * processing (no sharp) and no external image service.
 *
 * The caller sizes the box via `className` (e.g. `absolute inset-0 size-full`);
 * this component owns `object-fit`/`object-position`. Server component: the URL
 * and focal style are inlined into the static HTML, shipping no client JS.
 */
export function Media({ resource, alt, className, fit = 'cover', style }: MediaProps) {
  const media = resolveMedia(resource)
  if (!media?.url) return null

  // Payload stores the focal point as 0–100 percentages, which map directly to
  // object-position; default to centre when unset.
  const x = media.focalX ?? 50
  const y = media.focalY ?? 50

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.url}
      alt={alt ?? media.alt ?? ''}
      className={className}
      style={{ objectFit: fit, objectPosition: `${x}% ${y}%`, ...style }}
    />
  )
}

export default Media
