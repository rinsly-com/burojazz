import type { GroupField } from 'payload'

/**
 * Standard section header shared by every block: all parts optional so
 * editors can add "an extra subtitle" (or drop the eyebrow) anywhere without
 * schema changes.
 */
export const sectionHeader = (): GroupField => ({
  name: 'header',
  label: 'Section header',
  type: 'group',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'subtitle', type: 'text' },
    { name: 'intro', type: 'textarea' },
  ],
})
