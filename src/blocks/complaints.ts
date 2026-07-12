import type { Block } from 'payload'

import { iconField } from '../fields/icon'
import { sectionHeader } from '../fields/sectionHeader'

export const complaintsBlock: Block = {
  slug: 'complaints',
  interfaceName: 'ComplaintsBlock',
  labels: { singular: 'Complaints procedure', plural: 'Complaints procedure sections' },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title', 'intro']),
    {
      name: 'steps',
      label: 'Steps',
      labels: { singular: 'Step', plural: 'Steps' },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text' },
        { name: 'text', type: 'textarea' },
        {
          name: 'infoPills',
          label: 'Info callouts',
          labels: { singular: 'Callout', plural: 'Callouts' },
          type: 'array',
          admin: {
            initCollapsed: true,
            description: 'Rounded callouts inside the step card (icon + text).',
          },
          fields: [
            iconField({
              name: 'icon',
              label: 'Callout icon',
              description: 'Icoon in de ronde badge. Laat leeg voor het standaardicoon.',
            }),
            {
              name: 'tone',
              type: 'select',
              defaultValue: 'brand',
              options: [
                { label: 'Teal (brand)', value: 'brand' },
                { label: 'Red (danger)', value: 'danger' },
              ],
              admin: { description: 'Colour of the badge and text.' },
            },
            { name: 'text', type: 'textarea', label: 'Callout text' },
            {
              name: 'note',
              type: 'textarea',
              label: 'Follow-up line',
              admin: { description: 'Optional arrow line shown below the callout text.' },
            },
          ],
        },
      ],
    },
    {
      name: 'contact',
      label: 'Contact card',
      type: 'group',
      admin: { description: 'Optional "Nog vragen?" card shown below the steps.' },
      fields: [
        { name: 'title', type: 'text', admin: { description: 'Leave empty to hide the card.' } },
        { name: 'subtitle', type: 'text' },
        {
          name: 'photo',
          label: 'Portret',
          type: 'upload',
          relationTo: 'media',
        },
        { name: 'phone', label: 'Telefoonnummer', type: 'text' },
        { name: 'email', type: 'email' },
      ],
    },
  ],
}
