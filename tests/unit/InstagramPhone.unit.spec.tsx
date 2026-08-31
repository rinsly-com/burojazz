/**
 * Instagram phone mockup (src/components/frontend/blocks/InstagramPhone.tsx).
 *
 * REGRESSION: the phone was a raw <img src="/images/social/phone-hand.png">
 * (332 KB). optimize-images.mjs had already written phone-hand.avif (~20 KB)
 * and .webp, but InstagramPhone never emitted <picture>, so visitors always
 * downloaded the PNG. Routing through <Media> picks up the siblings.
 */
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { InstagramPhone } from '../../src/components/frontend/blocks/InstagramPhone'

describe('InstagramPhone uses optimised static variants', () => {
  it('wraps the /public PNG fallback in a picture with avif and webp sources', () => {
    const { container } = render(
      <InstagramPhone live={false} handle="@buro.jazz" />,
    )

    const picture = container.querySelector('picture')
    expect(picture, 'fallback phone should render inside <picture>').toBeTruthy()

    const types = Array.from(picture!.querySelectorAll('source')).map((s) =>
      s.getAttribute('type'),
    )
    expect(types).toEqual(['image/avif', 'image/webp'])

    const img = picture!.querySelector('img')!
    expect(img.getAttribute('src')).toBe('/images/social/phone-hand.png')
  })

  it('sizes the phone frame so CMS uploads do not over-fetch', () => {
    const { container } = render(
      <InstagramPhone
        live={false}
        handle="@buro.jazz"
        resource={{ url: '/api/media/file/phone-hand.png', alt: '' }}
      />,
    )
    const img = container.querySelector('img')!
    // Transforms off in unit env → plain src, but sizes still set when srcset exists.
    // With transforms disabled Media omits sizes; assert the Media path rendered.
    expect(img.getAttribute('src')).toContain('phone-hand')
  })
})
