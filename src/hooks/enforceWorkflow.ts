import type { CollectionBeforeChangeHook } from 'payload'
import { APIError } from 'payload'

import type { User } from '@/payload-types'
import { isReviewer } from '../access/roles'

export type WorkflowStatus = 'draft' | 'review' | 'ready'

/**
 * Enforces the editorial state machine and publish gating on the server, so the
 * rules hold regardless of what the admin UI or API sends:
 *
 *   Draft ─(author/reviewer)─► Review ─(reviewer approves)─► Ready ─(reviewer publishes)─► Published
 *
 * - Only reviewers can mark a page **Ready** or send it back.
 * - Publishing requires the reviewer role AND a current status of **Ready**.
 * - On publish the workflow resets to Draft so the next edit cycle starts clean
 *   (`_status` becomes `changed` on the next edit, i.e. "changes vs production").
 */
export const enforceWorkflow: CollectionBeforeChangeHook = ({ data, operation, originalDoc, req }) => {
  const user = req.user as User | null
  const reviewer = isReviewer(user)

  const targetStatus = data?._status // 'draft' | 'published'
  const isPublishAttempt = targetStatus === 'published'

  if (operation === 'create') {
    if (isPublishAttempt && !reviewer) {
      throw new APIError('Only reviewers can publish.', 403)
    }
    if (!isPublishAttempt) {
      data.workflowStatus = (data.workflowStatus as WorkflowStatus) || 'draft'
    }
    return data
  }

  const prev = (originalDoc?.workflowStatus as WorkflowStatus) ?? 'draft'
  const next = (data?.workflowStatus as WorkflowStatus) ?? prev

  // --- Publish gating ---
  if (isPublishAttempt) {
    if (!reviewer) {
      throw new APIError('Only reviewers can publish.', 403)
    }
    if (prev !== 'ready') {
      throw new APIError('A page must be in "Ready" before it can be published.', 403)
    }
    // Completed a cycle — reset for the next round of edits.
    data.workflowStatus = 'draft'
    return data
  }

  // --- Workflow status transition gating (draft edits) ---
  if (next !== prev) {
    // Only reviewers may approve (mark Ready) or move a Ready page back.
    if (next === 'ready' && !reviewer) {
      throw new APIError('Only reviewers can mark a page "Ready".', 403)
    }
    if (prev === 'ready' && !reviewer) {
      throw new APIError('Only reviewers can change a page that is "Ready".', 403)
    }
    // draft <-> review is open to any authenticated author.
  }

  return data
}
