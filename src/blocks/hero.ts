import type { Block } from 'payload'

import { link, linkGroup } from '../fields/link'
import { sectionHeader } from '../fields/sectionHeader'

export const heroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    sectionHeader(),
    linkGroup(),
    {
      name: 'cert',
      label: 'Certification',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'text', type: 'text' },
        link(),
      ],
    },
  ],
}
