import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticated, reviewerOnly, isReviewer } from '../access/roles'
import { pageBlocks } from '../blocks'
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
    // Preview environments (dev/accp) render every page's latest edit regardless
    // of workflow status, so editors always see their changes. Workflow status
    // only governs what ships to production: the production static build queries
    // published pages explicitly (see lib/pages.ts + BUILD_STATIC), so unpublished
    // drafts are previewable but never end up in prod.
    read: () => true,
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
    // Auto-generates a sanitized slug from the title (with a lock toggle to
    // override). Unique + required by default.
    slugField({ position: 'sidebar' }),
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
      name: 'layout',
      type: 'blocks',
      blocks: pageBlocks,
      admin: {
        initCollapsed: true,
        description: 'Page sections rendered on the site, in order.',
      },
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
