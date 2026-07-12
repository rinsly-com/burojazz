import type { Field, GroupField } from 'payload'

import { iconField } from './icon'

export type SectionHeaderPart = 'icon' | 'eyebrow' | 'title' | 'subtitle' | 'intro'

/**
 * Standard section header shared by the blocks. Each block passes exactly the
 * parts its frontend component renders — a part that is not in the list is
 * not editable, so the admin UI never offers a field that would silently
 * disappear on the site.
 */
export const sectionHeader = (
  parts: SectionHeaderPart[] = ['icon', 'eyebrow', 'title', 'subtitle', 'intro'],
): GroupField => {
  const include = new Set(parts)
  const fields: Field[] = []

  if (include.has('icon')) {
    fields.push(
      iconField({
        name: 'icon',
        label: 'Eyebrow icon',
        description: 'Icoon in het label boven de titel. Laat leeg voor het standaardicoon.',
      }),
    )
  }
  if (include.has('eyebrow')) fields.push({ name: 'eyebrow', type: 'text' })
  if (include.has('title')) fields.push({ name: 'title', type: 'text' })
  if (include.has('subtitle')) fields.push({ name: 'subtitle', type: 'text' })
  if (include.has('intro')) fields.push({ name: 'intro', type: 'textarea' })

  return {
    name: 'header',
    label: 'Section header',
    type: 'group',
    fields,
  }
}
