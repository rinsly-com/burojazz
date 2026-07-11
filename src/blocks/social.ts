import type { Block } from 'payload'

import { link } from '../fields/link'
import { sectionHeader } from '../fields/sectionHeader'

export const socialBlock: Block = {
  slug: 'social',
  interfaceName: 'SocialBlock',
  labels: { singular: 'Social', plural: 'Social sections' },
  fields: [sectionHeader(), { name: 'handle', type: 'text' }, link()],
}
