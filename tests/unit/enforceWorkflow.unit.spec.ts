/**
 * src/hooks/enforceWorkflow.ts — the server-side editorial state machine:
 *
 *   Draft ─(author)─► Review ─(reviewer)─► Ready ─(reviewer)─► Published
 *
 * These are access-control rules, not cosmetics: the hook is what stops a
 * non-reviewer publishing regardless of what the admin UI or a raw API call
 * sends. Every allow AND every deny is pinned.
 */
import { describe, expect, it } from 'vitest'

import type { User } from '@/payload-types'
import { enforceWorkflow } from '../../src/hooks/enforceWorkflow'

type Role = 'admin' | 'reviewer' | 'author'

const user = (...roles: Role[]) => ({ id: 1, roles }) as unknown as User

/** Invoke the hook the way Payload does, with only the args it reads. */
const run = (args: {
  data: Record<string, unknown>
  operation?: 'create' | 'update'
  originalDoc?: Record<string, unknown>
  user?: User | null
}) =>
  (
    enforceWorkflow as unknown as (a: {
      data: Record<string, unknown>
      operation: string
      originalDoc?: Record<string, unknown>
      req: { user: User | null }
    }) => Record<string, unknown>
  )({
    data: args.data,
    operation: args.operation ?? 'update',
    originalDoc: args.originalDoc,
    req: { user: args.user ?? null },
  })

describe('publish gating', () => {
  it.each([
    ['an anonymous request', null],
    ['an author', user('author')],
  ])('refuses to publish for %s', (_label, who) => {
    expect(() =>
      run({ data: { _status: 'published' }, originalDoc: { workflowStatus: 'ready' }, user: who }),
    ).toThrow(/Only reviewers can publish/)
  })

  it.each([
    ['reviewer', user('reviewer')],
    ['admin', user('admin')],
  ])('lets a %s publish a page that is Ready', (_label, who) => {
    const data = run({
      data: { _status: 'published' },
      originalDoc: { workflowStatus: 'ready' },
      user: who,
    })

    expect(data._status).toBe('published')
  })

  it.each(['draft', 'review'])('refuses to publish from the %s stage', (stage) => {
    expect(() =>
      run({
        data: { _status: 'published' },
        originalDoc: { workflowStatus: stage },
        user: user('reviewer'),
      }),
    ).toThrow(/must be in "Ready"/)
  })

  it('treats a doc with no recorded stage as draft, so it cannot be published', () => {
    expect(() =>
      run({ data: { _status: 'published' }, originalDoc: {}, user: user('reviewer') }),
    ).toThrow(/must be in "Ready"/)
  })

  it('resets the stage to draft after publishing, so the next edit starts clean', () => {
    const data = run({
      data: { _status: 'published' },
      originalDoc: { workflowStatus: 'ready' },
      user: user('admin'),
    })

    expect(data.workflowStatus).toBe('draft')
  })
})

describe('stage transitions', () => {
  it('lets an author move draft → review', () => {
    const data = run({
      data: { workflowStatus: 'review' },
      originalDoc: { workflowStatus: 'draft' },
      user: user('author'),
    })

    expect(data.workflowStatus).toBe('review')
  })

  it('stops an author marking a page Ready', () => {
    expect(() =>
      run({
        data: { workflowStatus: 'ready' },
        originalDoc: { workflowStatus: 'review' },
        user: user('author'),
      }),
    ).toThrow(/Only reviewers can mark a page "Ready"/)
  })

  it('lets a reviewer approve review → ready', () => {
    const data = run({
      data: { workflowStatus: 'ready' },
      originalDoc: { workflowStatus: 'review' },
      user: user('reviewer'),
    })

    expect(data.workflowStatus).toBe('ready')
  })

  it('stops an author pulling a Ready page back', () => {
    expect(() =>
      run({
        data: { workflowStatus: 'review' },
        originalDoc: { workflowStatus: 'ready' },
        user: user('author'),
      }),
    ).toThrow(/Only reviewers can change a page that is "Ready"/)
  })

  it('lets a reviewer send a Ready page back for more work', () => {
    const data = run({
      data: { workflowStatus: 'review' },
      originalDoc: { workflowStatus: 'ready' },
      user: user('reviewer'),
    })

    expect(data.workflowStatus).toBe('review')
  })

  it('allows a plain edit that does not change the stage', () => {
    const data = run({
      data: { title: 'New title' },
      originalDoc: { workflowStatus: 'ready' },
      user: user('author'),
    })

    expect(data.title).toBe('New title')
  })
})

describe('create', () => {
  it('defaults a new draft to the draft stage', () => {
    expect(run({ data: {}, operation: 'create', user: user('author') }).workflowStatus).toBe('draft')
  })

  it('keeps an explicitly requested stage on create', () => {
    expect(
      run({ data: { workflowStatus: 'review' }, operation: 'create', user: user('author') })
        .workflowStatus,
    ).toBe('review')
  })

  it('stops an author creating a page already published', () => {
    expect(() =>
      run({ data: { _status: 'published' }, operation: 'create', user: user('author') }),
    ).toThrow(/Only reviewers can publish/)
  })

  it('lets a reviewer create a published page', () => {
    expect(
      run({ data: { _status: 'published' }, operation: 'create', user: user('reviewer') })._status,
    ).toBe('published')
  })
})
