import type { Block } from 'payload'

import { sectionHeader } from '../fields/sectionHeader'

export const visionMissionBlock: Block = {
  slug: 'visionMission',
  interfaceName: 'VisionMissionBlock',
  labels: { singular: 'Vision & mission', plural: 'Vision & mission sections' },
  fields: [
    sectionHeader(),
    {
      name: 'items',
      label: 'Items',
      labels: { singular: 'Item', plural: 'Items' },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'textarea' },
      ],
    },
  ],
}
