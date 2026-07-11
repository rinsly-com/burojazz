import type { Block } from 'payload'

import { linkGroup } from '../fields/link'

export const buttonRowBlock: Block = {
  slug: 'buttonRow',
  interfaceName: 'ButtonRowBlock',
  labels: { singular: 'Button row', plural: 'Button rows' },
  fields: [
    linkGroup(),
    {
      name: 'alignment',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
}
