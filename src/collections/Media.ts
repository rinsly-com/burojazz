import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { en: 'Media', nl: 'Media' },
    plural: { en: 'Media', nl: 'Media' },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      label: { en: 'Alt text', nl: 'Alt-tekst' },
      type: 'text',
      required: true,
      admin: {
        description: {
          en: 'Short description of the image for screen readers and when the image can’t load. Important for accessibility and SEO.',
          nl: 'Korte beschrijving van de afbeelding voor schermlezers en als de afbeelding niet laadt. Belangrijk voor toegankelijkheid en SEO.',
        },
      },
    },
  ],
  upload: {
    // Focal point only — NO server-side crop. Cropping needs sharp to cut the
    // file, and sharp is Node-only (see payload.config.ts); on the accp Worker
    // it isn't available, so the crop tool threw "Something went wrong" in the
    // admin. Framing is instead done in the browser: editors set the focal
    // point (just stored focalX/focalY %, no image processing) and the frontend
    // applies it as CSS object-position (see components/frontend/ui/Media.tsx).
    focalPoint: true,
  },
}
