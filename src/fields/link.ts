import type { ArrayField, Field, GroupField, RowField } from 'payload'

/**
 * Reusable link/button field group (pattern from Payload's website template):
 * a label plus either an internal Pages reference (follows the page if its
 * slug changes) or an external URL, with a visual variant.
 */
type LinkArgs = {
  name?: string
  label?: string
}

/** The link destination row: internal Pages reference or external URL. */
const destinationRow = (): RowField => ({
  type: 'row',
  fields: [
    {
      name: 'type',
      type: 'radio',
      defaultValue: 'internal',
      options: [
        { label: 'Internal page', value: 'internal' },
        { label: 'External URL', value: 'external' },
      ],
      admin: { width: '40%', layout: 'horizontal' },
    },
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        width: '60%',
        condition: (_data, siblingData) => siblingData?.type === 'internal',
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        width: '60%',
        condition: (_data, siblingData) => siblingData?.type === 'external',
      },
    },
  ],
})

export const link = ({ name = 'link', label = 'Link' }: LinkArgs = {}): GroupField => ({
  name,
  label,
  type: 'group',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary (teal pill)', value: 'primary' },
            { label: 'Secondary (text + arrow)', value: 'secondary' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    destinationRow(),
    {
      name: 'newTab',
      type: 'checkbox',
      label: 'Open in new tab',
      defaultValue: false,
    },
  ],
})

/**
 * Link fields without the visual variant — for navigation menus (header nav
 * items, the header CTA) where the styling is fixed by the layout.
 * `requiredLabel: false` makes the whole link optional (e.g. an optional CTA
 * inside a group, where a required label would block saving the global).
 */
export const navLinkFields = ({ requiredLabel = true }: { requiredLabel?: boolean } = {}): Field[] => [
  {
    name: 'label',
    type: 'text',
    required: requiredLabel,
  },
  destinationRow(),
  {
    name: 'newTab',
    type: 'checkbox',
    label: 'Open in new tab',
    defaultValue: false,
  },
]

/** An unbounded list of links/buttons — any block can carry 0…N of them. */
export const linkGroup = ({ name = 'buttons', label = 'Buttons' }: LinkArgs = {}): ArrayField => ({
  name,
  label,
  type: 'array',
  labels: { singular: 'Button', plural: 'Buttons' },
  admin: { initCollapsed: true },
  fields: link({ name: 'link' }).fields,
})
