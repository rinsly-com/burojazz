import type { Block } from 'payload'

import { anchorField } from '../fields/anchor'
import { sectionHeader } from '../fields/sectionHeader'

export const coreValuesBlock: Block = {
  slug: 'coreValues',
  interfaceName: 'CoreValuesBlock',
  labels: {
    singular: { en: 'Core values', nl: 'Kernwaarden' },
    plural: { en: 'Core values sections', nl: 'Kernwaarden-secties' },
  },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title']),
    {
      name: 'logo',
      label: { en: 'Logo (center)', nl: 'Logo (midden)' },
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: {
          en: 'Logo shown in the center of the circle of values.',
          nl: 'Logo in het midden van de cirkel met waarden.',
        },
      },
    },
    {
      name: 'values',
      label: { en: 'Values', nl: 'Waarden' },
      labels: {
        singular: { en: 'Value', nl: 'Waarde' },
        plural: { en: 'Values', nl: 'Waarden' },
      },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'label', label: { en: 'Label', nl: 'Label' }, type: 'text' },
        {
          name: 'description',
          label: { en: 'Description', nl: 'Beschrijving' },
          type: 'textarea',
          admin: {
            description: {
              en: 'Shown when the card is hovered.',
              nl: 'Wordt getoond wanneer je met de muis over de kaart gaat.',
            },
          },
        },
        {
          name: 'image',
          label: { en: 'Icon', nl: 'Icoon' },
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: {
              en: 'Line-art icon shown in the value’s circle.',
              nl: 'Lijn-icoon in de cirkel van de waarde.',
            },
          },
        },
      ],
    },
    anchorField(),
  ],
}
