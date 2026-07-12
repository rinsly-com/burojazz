import type { Block } from 'payload'

import { anchorField } from '../fields/anchor'
import { sectionHeader } from '../fields/sectionHeader'

export const contactPersonsBlock: Block = {
  slug: 'contactPersons',
  interfaceName: 'ContactPersonsBlock',
  labels: { singular: 'Contact persons', plural: 'Contact persons sections' },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title', 'subtitle']),
    {
      name: 'people',
      label: 'People',
      labels: { singular: 'Person', plural: 'People' },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'name', type: 'text' },
        { name: 'role', type: 'text' },
        {
          name: 'photo',
          label: 'Portret',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Portretfoto, uitgelijnd op de onderkant van de kaart.' },
        },
        { name: 'phone', label: 'Telefoonnummer', type: 'text' },
        { name: 'email', type: 'email' },
      ],
    },
    anchorField(),
  ],
}
