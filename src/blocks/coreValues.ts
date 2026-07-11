import type { Block } from 'payload'

import { sectionHeader } from '../fields/sectionHeader'

export const coreValuesBlock: Block = {
  slug: 'coreValues',
  interfaceName: 'CoreValuesBlock',
  labels: { singular: 'Core values', plural: 'Core values sections' },
  fields: [
    sectionHeader(),
    {
      name: 'values',
      label: 'Values',
      labels: { singular: 'Value', plural: 'Values' },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [{ name: 'label', type: 'text' }],
    },
  ],
}
