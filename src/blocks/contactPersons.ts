import type { Block } from 'payload'

import { anchorField } from '../fields/anchor'
import { sectionHeader } from '../fields/sectionHeader'

export const contactPersonsBlock: Block = {
  slug: 'contactPersons',
  interfaceName: 'ContactPersonsBlock',
  labels: {
    singular: { en: 'Contact persons', nl: 'Contactpersonen' },
    plural: { en: 'Contact persons sections', nl: 'Contactpersoon-secties' },
  },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title', 'subtitle']),
    {
      name: 'people',
      label: { en: 'People', nl: 'Personen' },
      labels: {
        singular: { en: 'Person', nl: 'Persoon' },
        plural: { en: 'People', nl: 'Personen' },
      },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'name', label: { en: 'Name', nl: 'Naam' }, type: 'text' },
        { name: 'role', label: { en: 'Role', nl: 'Functie' }, type: 'text' },
        {
          name: 'photo',
          label: { en: 'Portrait', nl: 'Portret' },
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: {
              en: 'Portrait photo, aligned to the bottom of the card.',
              nl: 'Portretfoto, uitgelijnd op de onderkant van de kaart.',
            },
          },
        },
        { name: 'phone', label: { en: 'Phone', nl: 'Telefoonnummer' }, type: 'text' },
        { name: 'email', label: { en: 'Email', nl: 'E-mail' }, type: 'email' },
      ],
    },
    anchorField(),
  ],
}
