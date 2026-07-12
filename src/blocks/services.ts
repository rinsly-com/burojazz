import type { Block } from 'payload'

import { link } from '../fields/link'
import { sectionHeader } from '../fields/sectionHeader'

export const servicesBlock: Block = {
  slug: 'services',
  interfaceName: 'ServicesBlock',
  labels: { singular: 'Services', plural: 'Services' },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title']),
    {
      name: 'tabs',
      label: 'Tabs',
      labels: { singular: 'Tab', plural: 'Tabs' },
      type: 'array',
      admin: {
        initCollapsed: true,
        description: 'Each tab shows its own set of service cards on the site.',
      },
      fields: [
        { name: 'label', type: 'text' },
        {
          name: 'cards',
          label: 'Service cards',
          labels: { singular: 'Card', plural: 'Cards' },
          type: 'array',
          admin: { initCollapsed: true },
          fields: [
            { name: 'number', type: 'text' },
            { name: 'title', type: 'text' },
            { name: 'description', type: 'text' },
            link({ variant: false }),
          ],
        },
      ],
    },
  ],
}
