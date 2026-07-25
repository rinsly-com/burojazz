/**
 * src/components/WorkflowAction.tsx — the stage-aware action button.
 *
 * The bug this guards against took the homepage off production: advancing a
 * stage submitted `_status: 'draft'` against the edit form's DEFAULT action,
 * which carries no `draft=true`. Payload only routes a submit into the versions
 * table when that flag is present (`isSavingDraft`, payload's
 * collections/operations/utilities/update.js), so instead of writing a draft
 * version both transitions overwrote the LIVE row — silently unpublishing the
 * page. It then stopped matching `where[_status][equals]=published` and vanished
 * from the site on the next deploy, purely because an editor opened it.
 *
 * So: every stage transition MUST post to a `draft=true` URL, and publishing
 * MUST NOT.
 */
import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { submit, state } = vi.hoisted(() => ({
  submit: vi.fn(),
  state: {
    workflowStatus: 'draft' as string,
    _status: 'published' as string,
    roles: ['reviewer'] as string[],
    id: 42 as number | undefined,
    modified: true,
  },
}))

vi.mock('@payloadcms/ui', () => ({
  Button: ({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) => (
    <button disabled={disabled}>{children}</button>
  ),
  FormSubmit: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  useForm: () => ({ submit }),
  useAuth: () => ({ user: { id: 1, roles: state.roles } }),
  useDocumentInfo: () => ({ id: state.id, collectionSlug: 'pages' }),
  useFormModified: () => state.modified,
  useConfig: () => ({ config: { routes: { api: '/api' } } }),
  useLocale: () => ({ code: 'nl' }),
  useFormFields: (selector: (a: [Record<string, { value: unknown }>]) => unknown) =>
    selector([
      {
        workflowStatus: { value: state.workflowStatus },
        _status: { value: state._status },
      },
    ]),
}))

const { WorkflowAction } = await import('../../src/components/WorkflowAction')

/** Narrow a queried element to a button so `.disabled` is typed. */
const button = (el: HTMLElement) => el as HTMLButtonElement

/** The single argument the component handed to Payload's form submit(). */
const submitArg = () => submit.mock.calls[0]?.[0] as { action?: string; method?: string; overrides?: Record<string, unknown> }

beforeEach(() => {
  submit.mockClear()
  state.workflowStatus = 'draft'
  state._status = 'published'
  state.roles = ['reviewer']
  state.id = 42
  state.modified = true
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('stage transitions save a draft version, never the live row', () => {
  it.each([
    ['Submit for review', 'draft', 'review'],
    ['Approve (mark Ready)', 'review', 'ready'],
  ])('%s posts to a draft=true URL', async (label, from, to) => {
    state.workflowStatus = from
    render(<WorkflowAction />)

    fireEvent.click(screen.getByRole('button', { name: label }))

    const arg = submitArg()
    // The flag that keeps the published row intact. Without it this transition
    // unpublishes the page.
    expect(arg.action).toContain('draft=true')
    expect(arg.method).toBe('PATCH')
    expect(arg.overrides).toMatchObject({ _status: 'draft', workflowStatus: to })
  })

  it('targets the document being edited', async () => {
    render(<WorkflowAction />)

    fireEvent.click(screen.getByRole('button', { name: 'Submit for review' }))

    expect(submitArg().action).toContain('/pages/42')
  })

  it('keeps a published page published while it moves through review', async () => {
    // The whole point: the override says 'draft', but because it rides on a
    // draft=true request Payload writes a version, not the live row.
    state._status = 'published'
    render(<WorkflowAction />)

    fireEvent.click(screen.getByRole('button', { name: 'Submit for review' }))

    expect(submitArg().action).toContain('draft=true')
  })

  it('falls back to the default action for a document with no id yet', async () => {
    // Nothing is published for a brand-new doc, so there is nothing to protect.
    state.id = undefined
    render(<WorkflowAction />)

    fireEvent.click(screen.getByRole('button', { name: 'Submit for review' }))

    expect(submitArg().action).toBeUndefined()
  })
})

describe('publishing writes the live row', () => {
  it('does NOT post to a draft URL', async () => {
    state.workflowStatus = 'ready'
    render(<WorkflowAction />)

    fireEvent.click(screen.getByRole('button', { name: 'Publish changes' }))

    const arg = submitArg()
    expect(arg.action).toBeUndefined()
    expect(arg.overrides).toEqual({ _status: 'published' })
  })

  it('validates the document, unlike the stage transitions', async () => {
    state.workflowStatus = 'ready'
    render(<WorkflowAction />)

    fireEvent.click(screen.getByRole('button', { name: 'Publish changes' }))

    expect(submitArg()).toMatchObject({ skipValidation: false })
  })
})

describe('who sees which action', () => {
  it('offers an author the review step', () => {
    state.roles = ['author']
    render(<WorkflowAction />)

    expect(button(screen.getByRole('button', { name: 'Submit for review' })).disabled).toBe(false)
  })

  it.each([
    ['review', 'In review'],
    ['ready', 'Awaiting publish'],
  ])('shows an author a disabled %s state', (stage, label) => {
    state.roles = ['author']
    state.workflowStatus = stage
    render(<WorkflowAction />)

    expect(button(screen.getByRole('button', { name: label })).disabled).toBe(true)
  })

  it('lets an admin publish, not just a reviewer', () => {
    state.roles = ['admin']
    state.workflowStatus = 'ready'
    render(<WorkflowAction />)

    expect(button(screen.getByRole('button', { name: 'Publish changes' })).disabled).toBe(false)
  })

  it('shows a settled published page as done, with nothing to submit', () => {
    state.modified = false
    state.workflowStatus = 'draft'
    state._status = 'published'
    render(<WorkflowAction />)

    expect(button(screen.getByRole('button', { name: 'Published' })).disabled).toBe(true)
  })

  it('offers to submit again once a published page is edited', () => {
    state.modified = true
    state._status = 'published'
    render(<WorkflowAction />)

    expect(button(screen.getByRole('button', { name: 'Submit for review' })).disabled).toBe(false)
  })
})
