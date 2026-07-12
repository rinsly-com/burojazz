import type { CollectionConfig } from 'payload'

import { adminFieldOnly } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { en: 'User', nl: 'Gebruiker' },
    plural: { en: 'Users', nl: 'Gebruikers' },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'roles'],
  },
  auth: true,
  fields: [
    // Email added by default
    {
      name: 'roles',
      label: { en: 'Roles', nl: 'Rollen' },
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['author'],
      options: [
        { label: { en: 'Admin', nl: 'Beheerder' }, value: 'admin' },
        { label: { en: 'Reviewer', nl: 'Beoordelaar' }, value: 'reviewer' },
        { label: { en: 'Author', nl: 'Auteur' }, value: 'author' },
      ],
      // Roles are saved into the JWT so access checks avoid a DB lookup.
      saveToJWT: true,
      access: {
        // Only admins may grant/revoke roles.
        update: adminFieldOnly,
      },
      admin: {
        description: {
          en: 'Authors edit & submit for review. Reviewers approve (Ready) and publish.',
          nl: 'Auteurs bewerken en dienen in ter beoordeling. Beoordelaars keuren goed (Klaar) en publiceren.',
        },
      },
    },
  ],
}
