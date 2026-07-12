import type { Block } from 'payload'

import { basicEditor } from '../fields/basicEditor'
import { linkGroup } from '../fields/link'
import { sectionHeader } from '../fields/sectionHeader'

export const aboutBlock: Block = {
  slug: 'about',
  interfaceName: 'AboutBlock',
  labels: { singular: 'About', plural: 'About sections' },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title']),
    { name: 'body', type: 'richText', editor: basicEditor },
    { name: 'email', type: 'text' },
    linkGroup(),
  ],
}
