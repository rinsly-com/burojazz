/**
 * Structural guarantees about the Pages collection and the site-chrome globals.
 *
 * These assert *configuration*, not behaviour, because the incidents they guard
 * against were configuration mistakes: a hook wired into the wrong lifecycle
 * rebuilt production on every content change, and autosave would turn every
 * keystroke into a version (and, before the fix, a deploy).
 */
import { describe, expect, it } from 'vitest'

import { Pages } from '../../src/collections/Pages'
import { Footer } from '../../src/globals/Footer'
import { Header } from '../../src/globals/Header'
import { enforceWorkflow } from '../../src/hooks/enforceWorkflow'

/** Hook arrays Payload will run, flattened to a plain list. */
const hooksOf = (cfg: { hooks?: Record<string, unknown> }, name: string): unknown[] => {
  const list = cfg.hooks?.[name]
  return Array.isArray(list) ? list : []
}

describe('Pages — deploying stays a deliberate act', () => {
  it.each(['afterChange', 'afterDelete', 'afterOperation'])(
    'runs no %s hook, so content changes never trigger a deploy',
    (hook) => {
      // REGRESSION: an afterChange hook here fired on `isPublished ||
      // wasPublished`, so merely saving a draft of a live page rebuilt
      // production — a no-op build, since the static build ships published
      // content only.
      expect(hooksOf(Pages, hook)).toEqual([])
    },
  )

  it('still enforces the editorial state machine before every change', () => {
    expect(hooksOf(Pages, 'beforeChange')).toContain(enforceWorkflow)
  })
})

describe.each([
  ['Header', Header],
  ['Footer', Footer],
])('%s global — deploying stays a deliberate act', (_name, global) => {
  it('runs no afterChange hook', () => {
    // REGRESSION: these fired unconditionally with no diff check, so opening
    // site chrome and pressing save kicked off a production build.
    expect(hooksOf(global as { hooks?: Record<string, unknown> }, 'afterChange')).toEqual([])
  })

  it('is publicly readable so the static frontend can fetch it', () => {
    const read = (global as { access?: { read?: () => boolean } }).access?.read
    expect(read?.()).toBe(true)
  })
})

describe('Pages — drafts', () => {
  it('has drafts enabled, so published content survives an in-progress edit', () => {
    expect(Pages.versions).toBeTruthy()
    expect((Pages.versions as { drafts?: unknown }).drafts).toBeTruthy()
  })

  it('keeps autosave off', () => {
    // Autosave would write a version on every keystroke; combined with any
    // deploy-on-change hook that is a build per keypress.
    const drafts = (Pages.versions as { drafts?: { autosave?: boolean } }).drafts
    expect(drafts?.autosave).toBe(false)
  })

  it('caps stored versions per document', () => {
    expect((Pages.versions as { maxPerDoc?: number }).maxPerDoc).toBeGreaterThan(0)
  })
})

describe('Pages — access', () => {
  const call = (fn: unknown, user: unknown) =>
    (fn as (a: unknown) => boolean)({ req: { user } })

  it('is publicly readable — the static build fetches it over HTTP', () => {
    expect(call(Pages.access?.read, null)).toBe(true)
  })

  it.each([
    ['create', 'create'],
    ['update', 'update'],
  ])('requires a signed-in user to %s', (_label, op) => {
    expect(call(Pages.access?.[op as 'create'], null)).toBe(false)
    expect(call(Pages.access?.[op as 'create'], { id: 1, roles: ['author'] })).toBe(true)
  })

  it('restricts delete to reviewers', () => {
    expect(call(Pages.access?.delete, { id: 1, roles: ['author'] })).toBe(false)
    expect(call(Pages.access?.delete, { id: 1, roles: ['reviewer'] })).toBe(true)
    expect(call(Pages.access?.delete, null)).toBe(false)
  })
})
