import type { Block } from 'payload'

import { anchorField } from '../fields/anchor'
import { iconField } from '../fields/icon'
import { sectionHeader } from '../fields/sectionHeader'

export const complaintsBlock: Block = {
  slug: 'complaints',
  interfaceName: 'ComplaintsBlock',
  labels: {
    singular: { en: 'Complaints procedure', nl: 'Klachtenprocedure' },
    plural: { en: 'Complaints procedure sections', nl: 'Klachtenprocedure-secties' },
  },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title', 'intro']),
    {
      name: 'steps',
      label: { en: 'Steps', nl: 'Stappen' },
      labels: {
        singular: { en: 'Step', nl: 'Stap' },
        plural: { en: 'Steps', nl: 'Stappen' },
      },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', label: { en: 'Title', nl: 'Titel' }, type: 'text' },
        { name: 'text', label: { en: 'Text', nl: 'Tekst' }, type: 'textarea' },
        {
          name: 'infoPills',
          label: { en: 'Info callouts', nl: 'Info-meldingen' },
          labels: {
            singular: { en: 'Callout', nl: 'Melding' },
            plural: { en: 'Callouts', nl: 'Meldingen' },
          },
          type: 'array',
          admin: {
            initCollapsed: true,
            description: {
              en: 'Rounded callouts inside the step card (icon + text).',
              nl: 'Ronde meldingen in de stapkaart (icoon + tekst).',
            },
          },
          fields: [
            iconField({
              name: 'icon',
              label: { en: 'Callout icon', nl: 'Meldingicoon' },
              description: {
                en: 'Icon shown in the round badge. Leave empty for the default icon.',
                nl: 'Icoon in de ronde badge. Laat leeg voor het standaardicoon.',
              },
            }),
            {
              name: 'tone',
              label: { en: 'Tone', nl: 'Kleur' },
              type: 'select',
              defaultValue: 'brand',
              options: [
                { label: { en: 'Teal (brand)', nl: 'Turquoise (merk)' }, value: 'brand' },
                { label: { en: 'Red (danger)', nl: 'Rood (waarschuwing)' }, value: 'danger' },
              ],
              admin: {
                description: {
                  en: 'Colour of the badge and text.',
                  nl: 'Kleur van de badge en tekst.',
                },
              },
            },
            { name: 'text', type: 'textarea', label: { en: 'Callout text', nl: 'Meldingtekst' } },
            {
              name: 'note',
              type: 'textarea',
              label: { en: 'Follow-up line', nl: 'Vervolgregel' },
              admin: {
                description: {
                  en: 'Optional arrow line shown below the callout text.',
                  nl: 'Optionele pijlregel onder de meldingtekst.',
                },
              },
            },
          ],
        },
      ],
    },
    {
      name: 'contact',
      label: { en: 'Contact card', nl: 'Contactkaart' },
      type: 'group',
      admin: {
        description: {
          en: 'Optional "Nog vragen?" card shown below the steps.',
          nl: 'Optionele "Nog vragen?"-kaart onder de stappen.',
        },
      },
      fields: [
        {
          name: 'title',
          label: { en: 'Title', nl: 'Titel' },
          type: 'text',
          admin: {
            description: {
              en: 'Leave empty to hide the card.',
              nl: 'Laat leeg om de kaart te verbergen.',
            },
          },
        },
        { name: 'subtitle', label: { en: 'Subtitle', nl: 'Subtitel' }, type: 'text' },
        {
          name: 'photo',
          label: { en: 'Portrait', nl: 'Portret' },
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: {
              en: 'Portrait photo of the contact person.',
              nl: 'Portretfoto van de contactpersoon.',
            },
          },
        },
        { name: 'phone', label: { en: 'Phone', nl: 'Telefoonnummer' }, type: 'text' },
        { name: 'email', label: { en: 'Email', nl: 'E-mail' }, type: 'email' },
      ],
    },
    anchorField(),
  ],
}
