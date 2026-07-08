import type { CollectionConfig } from 'payload'

import { adminFieldOnly } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'roles'],
  },
  auth: true,
  fields: [
    // Email added by default
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['author'],
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Reviewer', value: 'reviewer' },
        { label: 'Author', value: 'author' },
      ],
      // Roles are saved into the JWT so access checks avoid a DB lookup.
      saveToJWT: true,
      access: {
        // Only admins may grant/revoke roles.
        update: adminFieldOnly,
      },
      admin: {
        description: 'Authors edit & submit for review. Reviewers approve (Ready) and publish.',
      },
    },
  ],
}
