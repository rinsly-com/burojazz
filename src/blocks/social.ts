import type { Block } from 'payload'

export const socialBlock: Block = {
  slug: 'social',
  interfaceName: 'SocialBlock',
  labels: {
    singular: 'Social',
    plural: 'Social sections',
  },
  fields: [
    { name: 'title', type: 'text' },
    { name: 'handle', type: 'text' },
    { name: 'subtitle', type: 'text' },
    { name: 'linkLabel', type: 'text' },
    { name: 'linkUrl', type: 'text' },
  ],
}
