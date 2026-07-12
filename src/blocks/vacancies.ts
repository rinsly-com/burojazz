import type { Block } from 'payload'

import { link } from '../fields/link'
import { sectionHeader } from '../fields/sectionHeader'

export const vacanciesBlock: Block = {
  slug: 'vacancies',
  interfaceName: 'VacanciesBlock',
  labels: { singular: 'Vacancies', plural: 'Vacancies sections' },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title', 'intro']),
    {
      name: 'cards',
      label: 'Vacancy cards',
      labels: { singular: 'Card', plural: 'Cards' },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text' },
        { name: 'location', type: 'text' },
        { name: 'hours', type: 'text' },
        { name: 'text', type: 'textarea' },
        link({ variant: false }),
      ],
    },
  ],
}
