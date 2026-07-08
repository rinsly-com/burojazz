import type { CollectionConfig } from 'payload'

import { authenticated, reviewerOnly, isReviewer } from '../access/roles'
import { enforceWorkflow } from '../hooks/enforceWorkflow'
import {
  triggerStaticDeployAfterChange,
  triggerStaticDeployAfterDelete,
} from '../hooks/triggerStaticDeploy'
import type { User } from '@/payload-types'

/**
 * Pages — content with a per-document PR-style review workflow:
 *
 *   Draft → Review → Ready → Published
 *
 * `workflowStatus` tracks the editorial pipeline while the document is a draft;
 * **Published** is Payload's native publish (`_status: published`), which fires
 * the Cloudflare Deploy Hook to rebuild the static production site. Transition
 * and publish rules are enforced server-side by `enforceWorkflow`.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'workflowStatus', 'updatedAt'],
    components: {
      edit: {
        // Stage-aware action button (Submit for review / Approve / Publish).
        PublishButton: '/components/WorkflowAction#WorkflowAction',
      },
    },
  },
  access: {
    // Public reads see published only; the static build fetches unauthenticated.
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
    create: authenticated,
    update: authenticated,
    delete: reviewerOnly,
  },
  versions: {
    drafts: {
      autosave: false,
    },
    maxPerDoc: 50,
  },
  hooks: {
    beforeChange: [enforceWorkflow],
    afterChange: [triggerStaticDeployAfterChange],
    afterDelete: [triggerStaticDeployAfterDelete],
  },
  fields: [
    {
      // Review status card — status, unpublished-changes flag, and a
      // "compare with production" link into the native version diff.
      name: 'reviewStatus',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '/components/ReviewPanel#ReviewPanel',
        },
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'workflowStatus',
      label: 'Stage',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Review', value: 'review' },
        { label: 'Ready', value: 'ready' },
      ],
      admin: {
        position: 'sidebar',
        // Driven by the stage-aware action button, not edited directly.
        readOnly: true,
        description: 'Advanced with the action button (Submit for review → Approve → Publish).',
        components: {
          // Colored stage chip in the list/table view.
          Cell: '/components/WorkflowStatusCell#WorkflowStatusCell',
        },
      },
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      // PR-style review comments for this page (see CommentsPanel).
      name: 'reviewComments',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/CommentsPanel#CommentsPanel',
        },
      },
    },
  ],
  timestamps: true,
}

/** Whether the given user may publish this collection (used by the UI too). */
export const canPublishPages = (user: User | null | undefined): boolean => isReviewer(user)
