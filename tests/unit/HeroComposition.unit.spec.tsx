/**
 * Hero decorative composition (src/components/frontend/blocks/Hero.tsx).
 *
 * REGRESSION: the desktop composition was laid out on a FIXED `w-[1512px]`
 * frame centred with `left-1/2 -translate-x-1/2`. Below 1512px the frame was
 * wider than the viewport, so it was cropped equally on both sides — 106px off
 * each edge at a 1300px viewport. The photo enters from the right, so the right
 * crop cut the subject's face out of the picture, and the framing changed with
 * every viewport width between the `xl` breakpoint (1280) and 1512.
 *
 * The fix lays the composition out in `cqw` (a percentage of the container's
 * own width) inside a `w-full max-w-[1512px]` container, so it scales
 * proportionally below 1512 and caps at the design size above it.
 *
 * jsdom does not do layout, so these assert the class contract that broke
 * rather than pixel geometry: a fixed-px frame or fixed-px shape offsets are
 * exactly the mistake being pinned.
 */
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Hero } from '../../src/components/frontend/blocks/Hero'

type HeroProps = Parameters<typeof Hero>[0]

/** No CMS data — the block renders its design defaults, which is all we need. */
const renderHero = () => {
  const { container } = render(<Hero {...({ blockType: 'hero' } as HeroProps)} />)
  return container
}

describe('the fixed-frame regression', () => {
  it('sizes the decorative frame fluidly, capped at the design width', () => {
    const frame = renderHero().querySelector('[aria-hidden="true"]')!
    const cls = frame.className

    // The bug: a fixed w-[1512px] frame, cropped at both edges below 1512.
    // Anchored to a class boundary so it does not match `max-w-[1512px]`.
    expect(cls).not.toMatch(/(?:^|\s)w-\[1512px\]/)
    expect(cls).toMatch(/\bw-full\b/)
    expect(cls).toMatch(/\bmax-w-\[1512px\]/)
  })

  it('establishes a container so cqw offsets have something to resolve against', () => {
    const frame = renderHero().querySelector('[aria-hidden="true"]')!
    // Without @container, every cqw below silently resolves against the
    // viewport (or 0), which is a different — and wrong — composition.
    expect(frame.className).toMatch(/@container/)
  })

  it('positions and sizes every decorative shape in cqw, never fixed px', () => {
    const frame = renderHero().querySelector('[aria-hidden="true"]')!
    const shapes = [frame, ...Array.from(frame.querySelectorAll('*'))]

    for (const el of shapes) {
      const offsets = el.className.match(/\b(?:-?(?:left|top|w|h|size)-\[[^\]]+\])/g) ?? []
      for (const offset of offsets) {
        // max-w-[1512px] is the intentional cap and is matched separately above.
        if (offset.includes('1512px')) continue
        expect(offset, `${offset} should be expressed in cqw so it scales`).toMatch(/cqw\]/)
      }
    }
  })

  it('scales the photo itself, not just its frame', () => {
    // The <img> covering the tilted panel was sized 1581x1616 in fixed px. Left
    // alone, the panel would shrink while the photo did not — zooming further
    // in at exactly the narrow widths that were already too tight.
    // Identified by its counter-rotation: the only image inside the tilted
    // panel. (Matching any <img> here would find the decorative blob instead,
    // which stayed in cqw and would hide the regression.)
    const imgs = Array.from(
      renderHero().querySelectorAll<HTMLElement>('[aria-hidden="true"] img'),
    )
    const photo = imgs.find((el) => el.style.transform?.includes('rotate(30deg)'))
    expect(photo, 'the counter-rotated hero photo should be rendered').toBeDefined()

    // Its size and pan depend on the focal crop, so they are an inline style
    // rather than Tailwind classes — assert cqw there, and no px anywhere.
    expect(photo!.className).not.toMatch(/\b[wh]-\[\d+px\]/)
    expect(photo!.style.width).toMatch(/cqw$/)
    expect(photo!.style.height).toMatch(/cqw$/)
    expect(photo!.style.transform).toMatch(/cqw/)
  })
})
