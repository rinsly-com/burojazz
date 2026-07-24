'use client'

import React, { useCallback } from 'react'
import { formatAdminURL } from 'payload/shared'
import {
  Button,
  FormSubmit,
  useAuth,
  useConfig,
  useDocumentInfo,
  useForm,
  useFormFields,
  useFormModified,
  useLocale,
} from '@payloadcms/ui'

import type { User } from '@/payload-types'
import { isReviewer } from '../access/roles'

/**
 * Replaces the default "Publish" button with a single stage-aware action that
 * advances the workflow (and saves the current edits at the same time via the
 * form's submit + overrides):
 *
 *   Draft   → "Submit for review"  (author or reviewer)
 *   Review  → "Approve (Ready)"    (reviewer only)
 *   Ready   → "Publish changes"    (reviewer only) → production rebuild
 *
 * The same rules are enforced server-side by enforceWorkflow. The separate
 * "Save draft" button still saves without advancing the stage.
 *
 * Advancing a stage must save the edits as a DRAFT VERSION, never as the live
 * row. Payload only treats a submit as a draft save when the request URL carries
 * `draft=true` (see `isSavingDraft` in payload's collections/operations/
 * utilities/update.js) — the edit form's default action does not. Without it a
 * `_status: 'draft'` override rewrites the published row, silently UNPUBLISHING
 * the page: it then drops out of `where[_status][equals]=published` and vanishes
 * from production on the next deploy, purely because someone started working on
 * it. So the two stage transitions post to an explicit draft URL, mirroring
 * Payload's own SaveDraftButton. Publishing keeps the default action, since it
 * is meant to write the live row.
 */
export const WorkflowAction: React.FC = () => {
  const { submit } = useForm()
  const { user } = useAuth()
  const { id, collectionSlug } = useDocumentInfo()
  const modified = useFormModified()
  const {
    config: {
      routes: { api },
    },
  } = useConfig()
  const { code: locale } = useLocale()

  const draftAction = React.useMemo(() => {
    if (!collectionSlug || !id) return undefined
    return formatAdminURL({
      apiRoute: api,
      path: `/${collectionSlug}/${id}?locale=${locale}&depth=0&fallback-locale=null&draft=true`,
    })
  }, [api, collectionSlug, id, locale])

  const workflowStatus =
    useFormFields(([fields]) => fields?.workflowStatus?.value as string | undefined) ?? 'draft'
  const status = useFormFields(([fields]) => fields?._status?.value as string | undefined)

  const reviewer = isReviewer(user as User | null)

  /**
   * Advance the stage, storing the edits as a draft version so the currently
   * published content stays live (and keeps shipping) until someone publishes.
   * On a brand-new doc there is no id yet, so there is nothing published to
   * protect and the default action is correct.
   */
  const advance = useCallback(
    (overrides: Record<string, unknown>) =>
      () => {
        void submit({
          ...(draftAction ? { action: draftAction, method: 'PATCH' } : {}),
          overrides,
          skipValidation: true,
        })
      },
    [submit, draftAction],
  )

  /** Publish: promotes the draft to the live row, so no draft=true here. */
  const publish = useCallback(() => {
    void submit({ overrides: { _status: 'published' }, skipValidation: false })
  }, [submit])

  const disabled = (label: string, reason: string) => (
    <span title={reason} style={{ display: 'inline-flex' }}>
      <Button buttonStyle="secondary" disabled>
        {label}
      </Button>
    </span>
  )

  // Already published with nothing new to submit.
  if (id && status === 'published' && !modified && workflowStatus === 'draft') {
    return disabled('Published', 'Live on production. Edit the page to start a new change.')
  }

  if (workflowStatus === 'ready') {
    if (!reviewer) return disabled('Awaiting publish', 'A reviewer will publish this.')
    return (
      <FormSubmit buttonStyle="primary" onClick={publish}>
        Publish changes
      </FormSubmit>
    )
  }

  if (workflowStatus === 'review') {
    if (!reviewer) return disabled('In review', 'A reviewer will approve this.')
    return (
      <FormSubmit
        buttonStyle="primary"
        onClick={advance({ _status: 'draft', workflowStatus: 'ready' })}
      >
        Approve (mark Ready)
      </FormSubmit>
    )
  }

  // Draft (or edited-after-publish): anyone with access can submit for review.
  return (
    <FormSubmit
      buttonStyle="primary"
      onClick={advance({ _status: 'draft', workflowStatus: 'review' })}
    >
      Submit for review
    </FormSubmit>
  )
}

export default WorkflowAction
