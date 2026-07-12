import type { Block } from 'payload'

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
  ],
}
