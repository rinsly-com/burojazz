import type { Block } from 'payload'

import { anchorField } from '../fields/anchor'
import { basicEditor } from '../fields/basicEditor'
import { iconField } from '../fields/icon'
import { link } from '../fields/link'
import { sectionHeader } from '../fields/sectionHeader'

export const servicesBlock: Block = {
  slug: 'services',
  interfaceName: 'ServicesBlock',
  labels: {
    singular: { en: 'Services', nl: 'Diensten' },
    plural: { en: 'Services', nl: 'Diensten' },
  },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title']),
    {
      name: 'tabs',
      label: { en: 'Tabs', nl: 'Tabbladen' },
      labels: {
        singular: { en: 'Tab', nl: 'Tabblad' },
        plural: { en: 'Tabs', nl: 'Tabbladen' },
      },
      type: 'array',
      admin: {
        initCollapsed: true,
        description: {
          en: 'Each tab shows its own set of service cards on the site.',
          nl: 'Elk tabblad toont zijn eigen set dienstkaarten op de site.',
        },
      },
      fields: [
        { name: 'label', label: { en: 'Label', nl: 'Label' }, type: 'text' },
        {
          name: 'cards',
          label: { en: 'Service cards', nl: 'Dienstkaarten' },
          labels: {
            singular: { en: 'Card', nl: 'Kaart' },
            plural: { en: 'Cards', nl: 'Kaarten' },
          },
          type: 'array',
          admin: { initCollapsed: true },
          fields: [
            iconField({
              name: 'icon',
              label: { en: 'Card icon', nl: 'Kaarticoon' },
              description: {
                en: 'Icon shown in the white circle on the card. Leave empty for the default icon.',
                nl: 'Icoon in de witte cirkel op de kaart. Laat leeg voor het standaardicoon.',
              },
            }),
            {
              name: 'number',
              label: { en: 'Number', nl: 'Nummer' },
              type: 'text',
              admin: {
                description: {
                  en: 'Small number shown on the card (e.g. 01).',
                  nl: 'Klein nummer op de kaart (bijv. 01).',
                },
              },
            },
            { name: 'title', label: { en: 'Title', nl: 'Titel' }, type: 'text' },
            { name: 'description', label: { en: 'Description', nl: 'Beschrijving' }, type: 'text' },
            {
              name: 'details',
              label: { en: 'Read more content', nl: 'Lees meer-inhoud' },
              type: 'richText',
              editor: basicEditor,
              admin: {
                description: {
                  en: 'Fill this in to open the full story in a dialog when the visitor clicks the read-more link. Leave empty to have the link navigate to the destination below instead.',
                  nl: 'Vul dit in om het hele verhaal in een dialoogvenster te openen wanneer de bezoeker op de lees-meer-link klikt. Laat leeg om de link naar de bestemming hieronder te laten navigeren.',
                },
              },
            },
            link({ variant: false }),
          ],
        },
      ],
    },
    anchorField(),
  ],
}
