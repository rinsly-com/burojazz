import type { Block } from 'payload'

import { linkGroup } from '../fields/link'
import { sectionHeader } from '../fields/sectionHeader'

export const aboutBlock: Block = {
  slug: 'about',
  interfaceName: 'AboutBlock',
  labels: { singular: 'About', plural: 'About sections' },
  fields: [
    sectionHeader(),
    { name: 'body', type: 'textarea' },
    { name: 'email', type: 'text' },
    linkGroup(),
  ],
}
