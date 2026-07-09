import type { Block } from 'payload'

import { sectionHeader } from '../fields/sectionHeader'

export const complaintsBlock: Block = {
  slug: 'complaints',
  interfaceName: 'ComplaintsBlock',
  labels: { singular: 'Complaints procedure', plural: 'Complaints procedure sections' },
  fields: [
    sectionHeader(),
    {
      name: 'steps',
      label: 'Steps',
      labels: { singular: 'Step', plural: 'Steps' },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text' },
        { name: 'text', type: 'textarea' },
      ],
    },
  ],
}
