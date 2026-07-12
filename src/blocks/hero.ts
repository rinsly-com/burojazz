import type { Block } from 'payload'

import { linkGroup } from '../fields/link'
import { sectionHeader } from '../fields/sectionHeader'

export const heroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    // The hero has no eyebrow pill — the wordmark title takes its place.
    sectionHeader(['title', 'subtitle', 'intro']),
    {
      name: 'image',
      label: 'Hero image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Grote afbeelding die het rechtervlak van de hero vult.' },
    },
    linkGroup(),
  ],
}
