import type { Block } from 'payload'

export const visionMissionBlock: Block = {
  slug: 'visionMission',
  interfaceName: 'VisionMissionBlock',
  labels: {
    singular: 'Vision & mission',
    plural: 'Vision & mission sections',
  },
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'items',
      label: 'Items',
      labels: {
        singular: 'Item',
        plural: 'Items',
      },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'textarea' },
      ],
    },
  ],
}
