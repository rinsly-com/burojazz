/**
 * Section anchors on About and Vacancies (RenderBlocks + the block sections).
 *
 * REGRESSION: About hardcoded id="wie-wij-zijn" and Vacancies hardcoded
 * id="vacatures". The content endpoint now writes those anchors onto the
 * blocks, and RenderBlocks already emits the content anchor as the wrapper
 * id (the same id SectionSelect stores for nav items). The section repeated
 * it, so the page had two elements with one id and in-page links were
 * ambiguous. Each id must appear exactly once: from the content anchor when
 * that anchor is set, and from the historical fallback only when content
 * does not already publish it. `#wie-wij-zijn`, `#vacatures`, and the nav
 * hashes (`/#over-ons`, `/#vacatures`) have to keep resolving.
 */
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Page } from '@/payload-types'
import { RenderBlocks } from '@/components/frontend/RenderBlocks'

// RenderBlocks pulls in the complaints stepper, which registers GSAP
// ScrollTrigger at import time. jsdom has no matchMedia; this stub exists
// only so that import can finish. It does not exercise scroll behaviour.
vi.hoisted(() => {
  if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList
  }
})

afterEach(() => {
  cleanup()
})

type Block = NonNullable<Page['layout']>[number]

const about = (fields: { anchor?: string; id?: string } = {}): Block =>
  ({ blockType: 'about', ...fields }) as Block

const vacancies = (fields: { anchor?: string; id?: string } = {}): Block =>
  ({ blockType: 'vacancies', ...fields }) as Block

const renderLayout = (layout: Block[]) => render(<RenderBlocks layout={layout} />).container

/** Every element that publishes `id`, not just the first `getElementById` hit. */
const withId = (container: HTMLElement, id: string) => container.querySelectorAll(`[id="${id}"]`)

/** Hash links resolve through getElementById, which returns only the first match. */
const expectOnce = (container: HTMLElement, id: string, tag?: string) => {
  const hits = withId(container, id)
  expect(hits, id).toHaveLength(1)
  if (tag) expect(hits[0]?.tagName, id).toBe(tag)
  expect(document.getElementById(id), id).toBe(hits[0])
  return hits[0]
}

describe('about and vacancies anchors appear once', () => {
  it('keeps the historical ids when content has not published them', () => {
    const container = renderLayout([
      about({ id: 'about-block' }),
      vacancies({ id: 'vac-block' }),
    ])

    // Old links (#wie-wij-zijn, #vacatures) still land, on the section.
    expectOnce(container, 'wie-wij-zijn', 'SECTION')
    expectOnce(container, 'vacatures', 'SECTION')

    // Nav items that target the block id (no Anchor ID set yet) still land.
    expectOnce(container, 'about-block')
    expectOnce(container, 'vac-block')
  })

  it('does not repeat an anchor the content endpoint already wrote', () => {
    const container = renderLayout([
      about({ anchor: 'wie-wij-zijn', id: 'about-block' }),
      vacancies({ anchor: 'vacatures', id: 'vac-block' }),
    ])

    // The wrapper owns the id. The section must not repeat it.
    expectOnce(container, 'wie-wij-zijn', 'DIV')
    expect(container.querySelector('section[id="wie-wij-zijn"]')).toBeNull()
    expectOnce(container, 'vacatures', 'DIV')
    expect(container.querySelector('section[id="vacatures"]')).toBeNull()

    // The wrapper prefers the content anchor over the block id, so the old
    // block-id target is gone — SectionSelect stores the anchor instead.
    expect(withId(container, 'about-block')).toHaveLength(0)
    expect(withId(container, 'vac-block')).toHaveLength(0)
  })

  it('keeps nav hashes and the historical about id when they differ', () => {
    // Seeded home: Over ons scrolls to the content anchor `over-ons`, while
    // older links still use `#wie-wij-zijn`. Vacatures is the content anchor.
    const container = renderLayout([
      about({ anchor: 'over-ons', id: 'about-block' }),
      vacancies({ anchor: 'vacatures', id: 'vac-block' }),
    ])

    expectOnce(container, 'over-ons')
    expectOnce(container, 'wie-wij-zijn', 'SECTION')
    expectOnce(container, 'vacatures', 'DIV')
    expect(container.querySelector('section[id="vacatures"]')).toBeNull()
  })

  it.each([
    ['a leading hash', '#vacatures'],
    ['several leading hashes', '###vacatures'],
    ['surrounding whitespace', '  vacatures  '],
  ])('treats a content anchor written with %s as the one vacatures id', (_label, anchor) => {
    const container = renderLayout([vacancies({ anchor, id: 'vac-block' })])

    expectOnce(container, 'vacatures', 'DIV')
    expect(container.querySelector('section[id="vacatures"]')).toBeNull()
  })
})
