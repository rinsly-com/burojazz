import type { Block } from 'payload'

import { anchorField } from '../fields/anchor'
import { link } from '../fields/link'
import { sectionHeader } from '../fields/sectionHeader'

export const socialBlock: Block = {
  slug: 'social',
  interfaceName: 'SocialBlock',
  labels: {
    singular: { en: 'Social', nl: 'Social' },
    plural: { en: 'Social sections', nl: 'Social-secties' },
  },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title', 'subtitle']),
    {
      name: 'handle',
      label: { en: 'Handle', nl: 'Gebruikersnaam' },
      type: 'text',
      admin: {
        description: {
          en: 'Social media username shown in the section (e.g. @burojazz).',
          nl: 'Gebruikersnaam op social media die in de sectie wordt getoond (bijv. @burojazz).',
        },
      },
    },
    link({ variant: false }),
    {
      name: 'photos',
      label: { en: 'Collage photos', nl: 'Collage-foto’s' },
      type: 'group',
      admin: {
        description: {
          en: 'The photos in the collage, by position. Leave a slot empty to use the default photo.',
          nl: 'De sfeerfoto’s in de collage, per positie. Laat een plek leeg voor de standaardfoto.',
        },
      },
      fields: [
        { name: 'toys', label: { en: 'Top left', nl: 'Linksboven' }, type: 'upload', relationTo: 'media' },
        { name: 'gym', label: { en: 'Bottom left', nl: 'Linksonder' }, type: 'upload', relationTo: 'media' },
        { name: 'boxing', label: { en: 'Right (boxing)', nl: 'Rechts (boksen)' }, type: 'upload', relationTo: 'media' },
        { name: 'figures', label: { en: 'Top right', nl: 'Rechtsboven' }, type: 'upload', relationTo: 'media' },
        { name: 'phone', label: { en: 'Phone in hand', nl: 'Telefoon in hand' }, type: 'upload', relationTo: 'media' },
        { name: 'arrow', label: { en: 'Arrow doodle', nl: 'Pijl-doodle' }, type: 'upload', relationTo: 'media' },
        { name: 'instagram', label: { en: 'Instagram icon', nl: 'Instagram-icoon' }, type: 'upload', relationTo: 'media' },
      ],
    },
    anchorField(),
  ],
}
