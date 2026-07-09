import type { Block } from 'payload'

export const aboutBlock: Block = {
  slug: 'about',
  interfaceName: 'AboutBlock',
  labels: {
    singular: 'About',
    plural: 'About sections',
  },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'body', type: 'textarea' },
    { name: 'email', type: 'text' },
    { name: 'ctaLabel', type: 'text' },
  ],
}
