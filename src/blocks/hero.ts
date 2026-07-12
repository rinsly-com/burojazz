import type { Block } from 'payload'

import { anchorField } from '../fields/anchor'
import { linkGroup } from '../fields/link'
import { sectionHeader } from '../fields/sectionHeader'

export const heroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: {
    singular: { en: 'Hero', nl: 'Hero' },
    plural: { en: 'Heroes', nl: "Hero's" },
  },
  fields: [
    // The hero has no eyebrow pill — the wordmark title takes its place.
    sectionHeader(['title', 'subtitle', 'intro']),
    {
      name: 'image',
      label: { en: 'Hero image', nl: 'Hero-afbeelding' },
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: {
          en: 'Large image that fills the right-hand side of the hero.',
          nl: 'Grote afbeelding die het rechtervlak van de hero vult.',
        },
      },
    },
    linkGroup(),
    anchorField(),
  ],
}
