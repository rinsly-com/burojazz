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
    // Actually disable the crop tool. The comment above was the intent, but
    // without this flag Payload defaults `crop` to true and still renders the
    // Crop tab — where `if (cropData && sharp)` silently does nothing on the
    // Worker, so the crop appeared to save and never applied.
    crop: false,
    // Saving a focal point makes Payload re-fetch the original file (see
    // shouldReupload in payload/dist/uploads/generateFileData.js), and because
    // the R2 adapter sets disableLocalStorage it goes through getExternalFile.
    // That uses Payload's SSRF-guarded safeFetch, which imports `node:dns`
    // lookup + undici's Agent — neither exists in workerd. The throw surfaced
    // as a FileRetrievalError, which is why image settings could not be changed
    // on accp while working fine locally (Node has both).
    //
    // Safe to skip here: this code path only ever fetches the document's own
    // `/api/media/file/<filename>` URL resolved against the incoming request's
    // origin. No user-supplied URL reaches it — `pasteURL` is not enabled.
    skipSafeFetch: true,
  },
}
