import type { Block } from 'payload'

import { anchorField } from '../fields/anchor'
import { link } from '../fields/link'
import { sectionHeader } from '../fields/sectionHeader'

export const socialBlock: Block = {
  slug: 'social',
  interfaceName: 'SocialBlock',
  labels: { singular: 'Social', plural: 'Social sections' },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title', 'subtitle']),
    { name: 'handle', type: 'text' },
    link({ variant: false }),
    {
      name: 'photos',
      label: 'Collage-foto’s',
      type: 'group',
      admin: { description: 'De sfeerfoto’s in de collage. Laat leeg voor de standaardfoto.' },
      fields: [
        { name: 'toys', label: 'Linksboven', type: 'upload', relationTo: 'media' },
        { name: 'gym', label: 'Linksonder', type: 'upload', relationTo: 'media' },
        { name: 'boxing', label: 'Rechts (boksen)', type: 'upload', relationTo: 'media' },
        { name: 'figures', label: 'Rechtsboven', type: 'upload', relationTo: 'media' },
        { name: 'phone', label: 'Telefoon in hand', type: 'upload', relationTo: 'media' },
        { name: 'arrow', label: 'Pijl-doodle', type: 'upload', relationTo: 'media' },
        { name: 'instagram', label: 'Instagram-icoon', type: 'upload', relationTo: 'media' },
      ],
    },
    anchorField(),
  ],
}
