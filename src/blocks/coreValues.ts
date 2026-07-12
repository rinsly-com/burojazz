import type { Block } from 'payload'

import { anchorField } from '../fields/anchor'
import { sectionHeader } from '../fields/sectionHeader'

export const coreValuesBlock: Block = {
  slug: 'coreValues',
  interfaceName: 'CoreValuesBlock',
  labels: { singular: 'Core values', plural: 'Core values sections' },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title']),
    { name: 'logo', label: 'Logo (midden)', type: 'upload', relationTo: 'media' },
    {
      name: 'values',
      label: 'Values',
      labels: { singular: 'Value', plural: 'Values' },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'label', type: 'text' },
        {
          name: 'description',
          type: 'textarea',
          admin: { description: 'Shown when the card is hovered.' },
        },
        {
          name: 'image',
          label: 'Icon',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Line-art icon shown in the value’s circle.' },
        },
      ],
    },
    anchorField(),
  ],
}
