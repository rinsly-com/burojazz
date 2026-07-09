import type { Block } from 'payload'

export const complaintsBlock: Block = {
  slug: 'complaints',
  interfaceName: 'ComplaintsBlock',
  labels: {
    singular: 'Complaints procedure',
    plural: 'Complaints procedure sections',
  },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'intro', type: 'textarea' },
    {
      name: 'steps',
      label: 'Steps',
      labels: {
        singular: 'Step',
        plural: 'Steps',
      },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text' },
        { name: 'text', type: 'textarea' },
      ],
    },
  ],
}
