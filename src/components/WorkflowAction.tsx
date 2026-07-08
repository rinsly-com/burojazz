'use client'

import React, { useCallback } from 'react'
import {
  Button,
  FormSubmit,
  useAuth,
  useDocumentInfo,
  useForm,
  useFormFields,
  useFormModified,
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
 */
export const WorkflowAction: React.FC = () => {
  const { submit } = useForm()
  const { user } = useAuth()
  const { id } = useDocumentInfo()
  const modified = useFormModified()

  const workflowStatus =
    useFormFields(([fields]) => fields?.workflowStatus?.value as string | undefined) ?? 'draft'
  const status = useFormFields(([fields]) => fields?._status?.value as string | undefined)

  const reviewer = isReviewer(user as User | null)

  const go = useCallback(
    (overrides: Record<string, unknown>, skipValidation = true) =>
      () => {
        void submit({ overrides, skipValidation })
      },
    [submit],
  )

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
      <FormSubmit buttonStyle="primary" onClick={go({ _status: 'published' }, false)}>
        Publish changes
      </FormSubmit>
    )
  }

  if (workflowStatus === 'review') {
    if (!reviewer) return disabled('In review', 'A reviewer will approve this.')
    return (
      <FormSubmit
        buttonStyle="primary"
        onClick={go({ _status: 'draft', workflowStatus: 'ready' })}
      >
        Approve (mark Ready)
      </FormSubmit>
    )
  }

  // Draft (or edited-after-publish): anyone with access can submit for review.
  return (
    <FormSubmit
      buttonStyle="primary"
      onClick={go({ _status: 'draft', workflowStatus: 'review' })}
    >
      Submit for review
    </FormSubmit>
  )
}

export default WorkflowAction
