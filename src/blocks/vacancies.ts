import type { Block } from 'payload'

export const vacanciesBlock: Block = {
  slug: 'vacancies',
  interfaceName: 'VacanciesBlock',
  labels: {
    singular: 'Vacancies',
    plural: 'Vacancies sections',
  },
  fields: [
    { name: 'title', type: 'text' },
    { name: 'intro', type: 'textarea' },
    {
      name: 'cards',
      label: 'Vacancy cards',
      labels: {
        singular: 'Card',
        plural: 'Cards',
      },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text' },
        { name: 'location', type: 'text' },
        { name: 'hours', type: 'text' },
        { name: 'text', type: 'textarea' },
        { name: 'linkLabel', type: 'text' },
        { name: 'linkUrl', type: 'text' },
      ],
    },
  ],
}
