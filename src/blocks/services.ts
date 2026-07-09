import type { Block } from 'payload'

export const servicesBlock: Block = {
  slug: 'services',
  interfaceName: 'ServicesBlock',
  labels: {
    singular: 'Services',
    plural: 'Services',
  },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    {
      name: 'tabs',
      label: 'Tabs',
      labels: {
        singular: 'Tab',
        plural: 'Tabs',
      },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [{ name: 'label', type: 'text' }],
    },
    {
      name: 'cards',
      label: 'Service cards',
      labels: {
        singular: 'Card',
        plural: 'Cards',
      },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'number', type: 'text' },
        { name: 'title', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'linkLabel', type: 'text' },
        { name: 'linkUrl', type: 'text' },
      ],
    },
  ],
}
