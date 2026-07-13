import { ImageResponse } from 'next/og'

import type { Page } from '@/payload-types'
import { cfImageSrc } from './image'

/**
 * Open Graph image rendering, shared by the `opengraph-image` routes.
 *
 * Every page gets a branded 1200×630 card generated from its title (rendered
 * with next/og at build time in the static export, on demand on the accp
 * worker). Editors can override it per page by uploading `meta.image` (SEO
 * plugin) — when present we render that image full-bleed instead. Exactly one
 * card is produced per page, so only one `og:image` tag is ever emitted.
 */
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

const BRAND = '#51c2cc'
const INK = '#291f09'

/**
 * Absolute, render-time-reachable URL for a page's `meta.image` override, or
 * undefined when unset. In the static build the media lives on the accp origin
 * (PAYLOAD_API_URL) and is routed through Cloudflare Image Transformations at a
 * cover-cropped 1200px so the card is sharp and light. Returns undefined at
 * depth 0 (image is just an id) — the OG routes fetch at depth 1.
 */
export function metaImageUrl(page: Page | null | undefined): string | undefined {
  const image = (page as { meta?: { image?: unknown } } | null | undefined)?.meta?.image
  if (!image || typeof image !== 'object') return undefined
  const url = (image as { url?: string | null }).url
  if (!url) return undefined
  const origin = process.env.PAYLOAD_API_URL || 'http://localhost:3000'
  const absolute = new URL(url, origin).toString()
  return cfImageSrc(absolute, { width: OG_SIZE.width, fit: 'cover', quality: 90 })
}

export function renderOgImage({
  title,
  imageUrl,
}: {
  title: string
  imageUrl?: string | null
}): ImageResponse {
  if (imageUrl) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            width={OG_SIZE.width}
            height={OG_SIZE.height}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt=""
          />
        </div>
      ),
      OG_SIZE,
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: 88,
          background: INK,
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: BRAND,
          }}
        >
          Buro J.A.Z.Z.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              width: 140,
              height: 12,
              marginTop: 36,
              borderRadius: 999,
              background: BRAND,
            }}
          />
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: 'rgba(255,255,255,0.75)' }}>
          jeugdzorg · advies · zorg · zekerheid
        </div>
      </div>
    ),
    OG_SIZE,
  )
}
