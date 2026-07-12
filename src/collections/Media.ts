import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // Payload's built-in crop/focal tools. They apply server-side via sharp,
    // which is loaded in Node only (see payload.config.ts): cropping works in
    // local dev but is a no-op on the accp Worker, where sharp can't run.
    crop: true,
    focalPoint: true,
  },
}
