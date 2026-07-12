import type { GlobalConfig } from 'payload'

/**
 * Footer — tagline, contact details, menu/info link lists, and copyright.
 * Publicly readable so the static frontend can fetch it over HTTP.
 */
export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'media' },
    { name: 'certImage', label: 'Certificaat-logo', type: 'upload', relationTo: 'media' },
    { name: 'tagline', type: 'textarea' },
    { name: 'email', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'address', type: 'text' },
    {
      name: 'menuItems',
      type: 'array',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'infoLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    { name: 'copyright', type: 'text' },
  ],
}
