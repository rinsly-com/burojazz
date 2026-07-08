'use client'

import React from 'react'
import { useAuth, useDocumentInfo, useFormFields } from '@payloadcms/ui'

import type { User } from '@/payload-types'
import { isReviewer } from '../access/roles'

const LABELS: Record<string, string> = {
  draft: 'Draft',
  review: 'In review',
  ready: 'Ready',
}

/**
 * A review banner shown above the document controls: current stage, whether
 * there are unpublished changes vs production, a link into Payload's native
 * version diff ("compare with production"), and the next action for this user.
 * Rendered via admin.components.edit.beforeDocumentControls.
 */
export const ReviewPanel: React.FC = () => {
  const { id, collectionSlug } = useDocumentInfo()
  const { user } = useAuth()

  const workflowStatus = useFormFields(
    ([fields]) => fields?.workflowStatus?.value as string | undefined,
  )
  const status = useFormFields(([fields]) => fields?._status?.value as string | undefined)

  // New, unsaved documents have no versions to compare yet.
  if (!id) return null

  const reviewer = isReviewer(user as User | null)
  const isPublished = status === 'published'
  const hasPendingChanges = status === 'changed' || (!isPublished && Boolean(workflowStatus))
  const versionsUrl = `/admin/collections/${collectionSlug}/${id}/versions`

  let guidance: string
  if (isPublished) {
    guidance = 'Published — live on production.'
  } else if (workflowStatus === 'ready') {
    guidance = reviewer
      ? 'Approved. You can publish to production.'
      : 'Approved and awaiting a reviewer to publish.'
  } else if (workflowStatus === 'review') {
    guidance = reviewer
      ? 'Awaiting your review — approve by setting status to “Ready”.'
      : 'Submitted for review.'
  } else {
    guidance = 'Draft in progress. Move to “Review” when ready for feedback.'
  }

  return (
    <div
      style={{
        width: '100%',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 4,
        padding: '10px 14px',
        marginBottom: 16,
        background: 'var(--theme-elevation-50)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        fontSize: 13,
      }}
    >
      <strong>
        Stage: {isPublished ? 'Published' : (LABELS[workflowStatus ?? 'draft'] ?? 'Draft')}
      </strong>
      {hasPendingChanges && !isPublished && (
        <span style={{ color: 'var(--theme-warning-500)' }}>● unpublished changes</span>
      )}
      <span style={{ opacity: 0.8 }}>{guidance}</span>
      <a href={versionsUrl} style={{ fontWeight: 600 }}>
        Compare with production →
      </a>
    </div>
  )
}

export default ReviewPanel
