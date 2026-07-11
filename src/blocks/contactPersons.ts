import type { Block } from 'payload'

import { sectionHeader } from '../fields/sectionHeader'

export const contactPersonsBlock: Block = {
  slug: 'contactPersons',
  interfaceName: 'ContactPersonsBlock',
  labels: { singular: 'Contact persons', plural: 'Contact persons sections' },
  fields: [
    sectionHeader(),
    {
      name: 'people',
      label: 'People',
      labels: { singular: 'Person', plural: 'People' },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'name', type: 'text' },
        { name: 'role', type: 'text' },
      ],
    },
  ],
}
