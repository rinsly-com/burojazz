import type { Block } from 'payload'

import { anchorField } from '../fields/anchor'
import { basicEditor } from '../fields/basicEditor'
import { linkGroup } from '../fields/link'
import { sectionHeader } from '../fields/sectionHeader'

export const aboutBlock: Block = {
  slug: 'about',
  interfaceName: 'AboutBlock',
  labels: { singular: 'About', plural: 'About sections' },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title']),
    { name: 'image', label: 'Foto', type: 'upload', relationTo: 'media' },
    { name: 'body', type: 'richText', editor: basicEditor },
    { name: 'email', type: 'text' },
    linkGroup(),
    anchorField(),
  ],
}
