import type { Block } from 'payload'

export const contactPersonsBlock: Block = {
  slug: 'contactPersons',
  interfaceName: 'ContactPersonsBlock',
  labels: {
    singular: 'Contact persons',
    plural: 'Contact persons sections',
  },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'subtitle', type: 'text' },
    {
      name: 'people',
      label: 'People',
      labels: {
        singular: 'Person',
        plural: 'People',
      },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'name', type: 'text' },
        { name: 'role', type: 'text' },
      ],
    },
  ],
}
