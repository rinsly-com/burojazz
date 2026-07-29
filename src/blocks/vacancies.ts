import type { Block } from 'payload'

import { anchorField } from '../fields/anchor'
import { link, navLinkFields } from '../fields/link'
import { sectionHeader } from '../fields/sectionHeader'

export const vacanciesBlock: Block = {
  slug: 'vacancies',
  interfaceName: 'VacanciesBlock',
  labels: {
    singular: { en: 'Vacancies', nl: 'Vacatures' },
    plural: { en: 'Vacancies sections', nl: 'Vacature-secties' },
  },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title', 'intro']),
    {
      name: 'cards',
      label: { en: 'Vacancy cards', nl: 'Vacaturekaarten' },
      labels: {
        singular: { en: 'Card', nl: 'Kaart' },
        plural: { en: 'Cards', nl: 'Kaarten' },
      },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'image',
          label: { en: 'Photo', nl: 'Foto' },
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: {
              en: 'Photo shown on the left of the card.',
              nl: 'Foto die links op de kaart wordt getoond.',
            },
          },
        },
        { name: 'title', label: { en: 'Title', nl: 'Titel' }, type: 'text' },
        { name: 'location', label: { en: 'Location', nl: 'Locatie' }, type: 'text' },
        {
          name: 'hours',
          label: { en: 'Hours', nl: 'Uren' },
          type: 'text',
          admin: {
            description: {
              en: 'Working hours for the vacancy (e.g. 32–36 hours per week).',
              nl: 'Werkuren voor de vacature (bijv. 32–36 uur per week).',
            },
          },
        },
        { name: 'text', label: { en: 'Text', nl: 'Tekst' }, type: 'textarea' },
        link({ variant: false }),
      ],
    },
    {
      name: 'openApplication',
      label: { en: 'Open application line', nl: 'Open sollicitatie-regel' },
      type: 'group',
      admin: {
        description: {
          en: 'The line under the vacancy cards inviting an unsolicited application.',
          nl: 'De regel onder de vacaturekaarten die uitnodigt tot een open sollicitatie.',
        },
      },
      fields: [
        {
          name: 'text',
          label: { en: 'Text before the link', nl: 'Tekst vóór de link' },
          type: 'text',
          admin: {
            description: {
              en: 'The sentence shown before the link.',
              nl: 'De zin die vóór de link wordt getoond.',
            },
          },
        },
        ...navLinkFields({ requiredLabel: false }),
      ],
    },
    anchorField(),
  ],
}
