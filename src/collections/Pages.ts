import type { CollectionConfig } from 'payload'

import {
  triggerStaticDeployAfterChange,
  triggerStaticDeployAfterDelete,
} from '../hooks/triggerStaticDeploy'

/**
 * Pages — the seed content type that exercises the editorial workflow:
 *
 *   draft  ->  in_review (staging)  ->  published (pushed to prod)
 *
 * `reviewState` tracks the editorial stage while the document is still a draft.
 * Publishing (Payload's Status -> published) is the final "push": it flips
 * `_status` to `published` and fires the Cloudflare Deploy Hook, which rebuilds
 * the static production site from published content.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'reviewState', '_status', 'updatedAt'],
  },
  access: {
    // Public (unauthenticated) reads are limited to published documents; the
    // static prod build fetches over HTTP with no auth, so it only ever sees
    // published content. Editors (authenticated) see drafts too.
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  versions: {
    drafts: {
      // Flip to `{ interval: 100 }` later to enable autosave drafts.
      autosave: false,
    },
    maxPerDoc: 25,
  },
  hooks: {
    afterChange: [triggerStaticDeployAfterChange],
    afterDelete: [triggerStaticDeployAfterDelete],
  },
  fields: [
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
      name: 'reviewState',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In review / staging', value: 'in_review' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Editorial stage. When the page is ready, set Status to Published to push the site to production.',
      },
    },
    {
      name: 'content',
      type: 'richText',
    },
  ],
  timestamps: true,
}
