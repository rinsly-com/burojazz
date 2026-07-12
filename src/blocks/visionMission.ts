import type { Block } from 'payload'

import { anchorField } from '../fields/anchor'
import { basicEditor } from '../fields/basicEditor'
import { iconField } from '../fields/icon'
import { sectionHeader } from '../fields/sectionHeader'

export const visionMissionBlock: Block = {
  slug: 'visionMission',
  interfaceName: 'VisionMissionBlock',
  labels: {
    singular: { en: 'Vision & mission', nl: 'Visie & missie' },
    plural: { en: 'Vision & mission sections', nl: 'Visie & missie-secties' },
  },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title']),
    {
      name: 'image',
      label: { en: 'Photo', nl: 'Foto' },
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: {
          en: 'Photo shown alongside the vision & mission items.',
          nl: 'Foto die naast de visie- en missie-items wordt getoond.',
        },
      },
    },
    {
      name: 'items',
      label: { en: 'Items', nl: 'Items' },
      labels: {
        singular: { en: 'Item', nl: 'Item' },
        plural: { en: 'Items', nl: 'Items' },
      },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        iconField({
          description: {
            en: 'Icon shown in the round label. Leave empty for the default icon.',
            nl: 'Icoon in het ronde label. Laat leeg voor het standaardicoon.',
          },
        }),
        { name: 'heading', label: { en: 'Heading', nl: 'Kop' }, type: 'text' },
        { name: 'body', label: { en: 'Body', nl: 'Tekst' }, type: 'richText', editor: basicEditor },
      ],
    },
    anchorField(),
  ],
}
