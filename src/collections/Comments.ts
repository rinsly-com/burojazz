import type { CollectionConfig } from 'payload'

import { authenticated, reviewerOnly } from '../access/roles'

/**
 * Comments — PR-style review threads on a page's pending changes. Each comment
 * targets a page (and optionally a specific version and field path), can reply
 * to another comment to form a thread, and can be resolved. The review UI
 * (phase 3) reads/writes this collection.
 */
export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'body',
    defaultColumns: ['body', 'page', 'author', 'resolved', 'createdAt'],
    group: 'Workflow',
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: reviewerOnly,
  },
  fields: [
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      required: true,
      index: true,
    },
    {
      name: 'versionId',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        description: 'The page version this comment was made against.',
      },
    },
    {
      name: 'fieldPath',
      type: 'text',
      admin: {
        description: 'Optional dot-path of the field the comment targets (for inline comments).',
      },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    {
      name: 'resolved',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'comments',
      admin: { description: 'Set to reply within a thread.' },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation === 'create' && req.user) {
          data.author = req.user.id
        }
        return data
      },
    ],
  },
  timestamps: true,
}
