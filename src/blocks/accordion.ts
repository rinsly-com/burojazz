import type { Block } from 'payload'

import { sectionHeader } from '../fields/sectionHeader'

export const accordionBlock: Block = {
  slug: 'accordion',
  interfaceName: 'AccordionBlock',
  labels: { singular: 'Accordion', plural: 'Accordions' },
  fields: [
    sectionHeader(),
    {
      name: 'items',
      label: 'Items',
      labels: { singular: 'Item', plural: 'Items' },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'richText' },
      ],
    },
  ],
}
