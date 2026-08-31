/**
 * MediaImage — client half of `<Media>` that drops `rt-media--skeleton`.
 *
 * REGRESSION: the shimmer lived as the <img> CSS background. Opaque photos hid
 * it; transparent PNGs (boxing cutout, avatar cutouts) showed it forever when
 * `onLoad` lost the race against the HTML parser under static-export hydration.
 * Cached images must clear the class on mount via `img.complete`, not only via
 * the React `onLoad` prop.
 *
 * Also: `<Media>` must not apply the skeleton at all for `.png`/`.svg` sources
 * under `cover` — even a late dismiss leaves one frame of shimmer through alpha.
 */
import { act, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Media } from '@rinsly-com/site-core/ui'
import { MediaImage } from '../../node_modules/@rinsly-com/site-core/src/components/frontend/ui/MediaImage'

afterEach(() => {
  // Undo any prototype stub from the complete-on-mount case.
  Reflect.deleteProperty(HTMLImageElement.prototype, 'complete')
})

describe('MediaImage drops the skeleton once the image is ready', () => {
  it('clears rt-media--skeleton when the image is already complete on mount', async () => {
    // jsdom leaves complete=false; real browsers often have it true for cache
    // hits before React hydrates — that is the race this path covers.
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {
      configurable: true,
      get: () => true,
    })

    const { container } = render(
      <MediaImage skeleton src="/images/about/directors.jpg" alt="" />,
    )
    const img = container.querySelector('img')!

    await waitFor(() => {
      expect(img.className).not.toContain('rt-media--skeleton')
    })
  })

  it('clears rt-media--skeleton when a late load event fires', async () => {
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {
      configurable: true,
      get: () => false,
    })

    const { container } = render(
      <MediaImage skeleton src="/api/media/file/pending.jpg" alt="" />,
    )
    const img = container.querySelector('img') as HTMLImageElement
    expect(img.className).toContain('rt-media--skeleton')

    await act(async () => {
      img.dispatchEvent(new Event('load'))
    })

    await waitFor(() => {
      expect(img.className).not.toContain('rt-media--skeleton')
    })
  })
})

describe('Media skips skeleton for alpha-prone formats', () => {
  // REGRESSION: photo-boxing.png and cutout avatars kept the shimmer visible
  // through transparent pixels after the image had painted.
  it('does not put rt-media--skeleton on a PNG cover image', () => {
    const { container } = render(
      <Media
        resource={{ url: '/api/media/file/photo-boxing.png', alt: '' }}
        className="w-full"
      />,
    )
    const img = container.querySelector('img')!
    expect(img.className).not.toContain('rt-media--skeleton')
  })

  it('renders a JPEG cover image through MediaImage (dismiss path)', () => {
    const { container } = render(
      <Media
        resource={{ url: '/api/media/file/directors.jpg', alt: '' }}
        className="w-full"
      />,
    )
    expect(container.querySelector('img')).toBeTruthy()
  })
})
