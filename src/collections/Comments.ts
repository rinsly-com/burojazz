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
  labels: {
    singular: { en: 'Comment', nl: 'Reactie' },
    plural: { en: 'Comments', nl: 'Reacties' },
  },
  admin: {
    useAsTitle: 'body',
    defaultColumns: ['body', 'page', 'author', 'resolved', 'createdAt'],
    group: { en: 'Workflow', nl: 'Werkstroom' },
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
      label: { en: 'Page', nl: 'Pagina' },
      type: 'relationship',
      relationTo: 'pages',
      required: true,
      index: true,
    },
    {
      name: 'versionId',
      label: { en: 'Version ID', nl: 'Versie-ID' },
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        description: {
          en: 'The page version this comment was made against.',
          nl: 'De paginaversie waarop deze reactie is gemaakt.',
        },
      },
    },
    {
      name: 'fieldPath',
      label: { en: 'Field path', nl: 'Veldpad' },
      type: 'text',
      admin: {
        description: {
          en: 'Optional dot-path of the field the comment targets (for inline comments).',
          nl: 'Optioneel dot-pad van het veld waarop de reactie betrekking heeft (voor inline reacties).',
        },
      },
    },
    {
      name: 'body',
      label: { en: 'Comment', nl: 'Reactie' },
      type: 'textarea',
      required: true,
    },
    {
      name: 'author',
      label: { en: 'Author', nl: 'Auteur' },
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    {
      name: 'resolved',
      label: { en: 'Resolved', nl: 'Opgelost' },
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'parent',
      label: { en: 'Parent', nl: 'Bovenliggende reactie' },
      type: 'relationship',
      relationTo: 'comments',
      admin: {
        description: {
          en: 'Set to reply within a thread.',
          nl: 'Instellen om binnen een thread te reageren.',
        },
      },
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
