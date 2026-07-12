import type { Block } from 'payload'

import { anchorField } from '../fields/anchor'
import { basicEditor } from '../fields/basicEditor'
import { sectionHeader } from '../fields/sectionHeader'

export const accordionBlock: Block = {
  slug: 'accordion',
  interfaceName: 'AccordionBlock',
  labels: { singular: 'Accordion', plural: 'Accordions' },
  fields: [
    // The accordion renders its eyebrow as plain text, without an icon pill.
    sectionHeader(['eyebrow', 'title', 'subtitle', 'intro']),
    {
      name: 'items',
      label: 'Items',
      labels: { singular: 'Item', plural: 'Items' },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'richText', editor: basicEditor },
      ],
    },
    anchorField(),
  ],
}
