'use client'

import { useEffect, useState } from 'react'

import { Media, type MediaResource } from '@rinsly-com/site-core/ui'

type Post = {
  permalink: string
  imageUrl: string
  caption: string | null
}

/**
 * Position of the Instagram post photo on the phone screen, as a fraction of
 * the phone-hand.png source (1280×1024). Measured from the artwork; retune here
 * if the phone image is ever replaced.
 */
const SCREEN = { left: '40.1%', top: '34.2%', width: '19.4%', height: '24.2%' } as const

/** Matches the phone frame: max-w 560 / 762 across breakpoints. */
const PHONE_SIZES = '(min-width: 768px) 762px, 560px'

/** Base URL of the Payload API — empty same-origin in dev, the accp origin in
 *  the static build (same env the aanmelden form uses). */
const API_BASE = process.env.NEXT_PUBLIC_PAYLOAD_API_URL ?? ''

/**
 * The hand-held phone in the social collage. Always renders the phone mockup
 * (`resource` or `fallbackSrc`); when `live` is on and the worker returns a
 * post, it overlays that post's image on the phone screen and links to it. Any
 * failure — integration unconfigured, network error, no posts — leaves the
 * static mockup exactly as-is.
 *
 * Uses `<Media>` so CMS uploads get a sized CF srcset and the /public PNG
 * fallback gets `<picture>` AVIF/WebP siblings (phone-hand.png was 332 KB;
 * phone-hand.avif is ~20 KB).
 */
export function InstagramPhone({
  resource,
  fallbackSrc = '/images/social/phone-hand.png',
  live,
  handle,
}: {
  resource?: MediaResource
  fallbackSrc?: string
  live: boolean
  handle: string
}) {
  const [post, setPost] = useState<Post | null>(null)

  useEffect(() => {
    if (!live) return
    let cancelled = false
    fetch(`${API_BASE}/api/instagram/latest`)
      .then((r) => (r.ok ? (r.json() as Promise<{ post?: Post | null }>) : null))
      .then((data) => {
        if (!cancelled && data?.post) setPost(data.post)
      })
      .catch(() => {
        /* keep the static mockup */
      })
    return () => {
      cancelled = true
    }
  }, [live])

  return (
    <div className="relative mx-auto aspect-[762/694] w-full max-w-[560px] overflow-hidden md:max-w-[762px]">
      {/* Wrapper matches the full phone-hand.png box; the phone image fills it
          and post overlays are positioned as fractions of it. */}
      <div className="absolute left-[-33.4%] top-[-34.15%] h-[146.41%] w-[166.8%] max-w-none">
        <Media
          resource={resource}
          fallbackSrc={fallbackSrc}
          alt={`Telefoon met de Instagram-feed van ${handle}`}
          sizes={PHONE_SIZES}
          skeleton={false}
          className="absolute inset-0 h-full w-full"
        />
        {post && (
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Meest recente Instagram-post van ${handle}`}
            className="absolute block overflow-hidden"
            style={{ left: SCREEN.left, top: SCREEN.top, width: SCREEN.width, height: SCREEN.height }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt={post.caption ?? `Instagram-post van ${handle}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </a>
        )}
      </div>
    </div>
  )
}
