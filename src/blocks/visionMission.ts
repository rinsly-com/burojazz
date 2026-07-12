import type { Block } from 'payload'

import { anchorField } from '../fields/anchor'
import { basicEditor } from '../fields/basicEditor'
import { iconField } from '../fields/icon'
import { sectionHeader } from '../fields/sectionHeader'

export const visionMissionBlock: Block = {
  slug: 'visionMission',
  interfaceName: 'VisionMissionBlock',
  labels: { singular: 'Vision & mission', plural: 'Vision & mission sections' },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title']),
    { name: 'image', label: 'Foto', type: 'upload', relationTo: 'media' },
    {
      name: 'items',
      label: 'Items',
      labels: { singular: 'Item', plural: 'Items' },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        iconField({ description: 'Icoon in het ronde label. Laat leeg voor het standaardicoon.' }),
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'richText', editor: basicEditor },
      ],
    },
    anchorField(),
  ],
}
