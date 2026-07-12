import type { GlobalConfig } from 'payload'

import { authenticated } from '../access/roles'

/**
 * Footer — tagline, contact details, menu/info link lists, and copyright.
 * Publicly readable so the static frontend can fetch it over HTTP.
 */
export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    // Any signed-in staff can edit site chrome (matches the collections). Public
    // read is required so the static frontend can fetch it over HTTP.
    update: authenticated,
  },
  fields: [
    {
      name: 'logo',
      label: 'Logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: {
          en: 'Logo shown in the footer.',
          nl: 'Logo in de footer.',
        },
      },
    },
    {
      name: 'certImage',
      label: { en: 'Certification logo', nl: 'Certificaat-logo' },
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: {
          en: 'Certification or quality-mark logo shown in the footer.',
          nl: 'Certificaat- of keurmerklogo in de footer.',
        },
      },
    },
    {
      name: 'tagline',
      label: { en: 'Tagline', nl: 'Slogan' },
      type: 'textarea',
      admin: {
        description: {
          en: 'Short line of text shown next to the footer logo.',
          nl: 'Korte tekstregel naast het footerlogo.',
        },
      },
    },
    { name: 'email', label: { en: 'Email', nl: 'E-mail' }, type: 'text' },
    { name: 'phone', label: { en: 'Phone', nl: 'Telefoon' }, type: 'text' },
    { name: 'address', label: { en: 'Address', nl: 'Adres' }, type: 'text' },
    {
      name: 'menuItems',
      label: { en: 'Menu items', nl: 'Menu-items' },
      type: 'array',
      labels: {
        singular: { en: 'Menu item', nl: 'Menu-item' },
        plural: { en: 'Menu items', nl: 'Menu-items' },
      },
      admin: {
        description: {
          en: 'Main navigation links in the footer (first column).',
          nl: 'Belangrijkste navigatielinks in de footer (eerste kolom).',
        },
      },
      fields: [
        { name: 'label', label: { en: 'Label', nl: 'Label' }, type: 'text' },
        { name: 'url', label: { en: 'URL', nl: 'URL' }, type: 'text' },
      ],
    },
    {
      name: 'infoLinks',
      label: { en: 'Info links', nl: 'Info-links' },
      type: 'array',
      labels: {
        singular: { en: 'Info link', nl: 'Info-link' },
        plural: { en: 'Info links', nl: 'Info-links' },
      },
      admin: {
        description: {
          en: 'Secondary links such as privacy statement and terms (second column).',
          nl: 'Secundaire links zoals privacyverklaring en voorwaarden (tweede kolom).',
        },
      },
      fields: [
        { name: 'label', label: { en: 'Label', nl: 'Label' }, type: 'text' },
        { name: 'url', label: { en: 'URL', nl: 'URL' }, type: 'text' },
      ],
    },
    { name: 'copyright', label: { en: 'Copyright', nl: 'Copyright' }, type: 'text' },
  ],
}
