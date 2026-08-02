/**
 * Media upload configuration.
 *
 * REGRESSION: no image setting — crop or focal point — could be changed in the
 * accp CMS, while both worked locally. Two separate causes, both configuration:
 *
 * 1. Saving a focal point makes Payload re-fetch the original file
 *    (`shouldReupload` in payload/dist/uploads/generateFileData.js). The R2
 *    adapter sets `disableLocalStorage`, so the re-fetch goes through
 *    `getExternalFile` → `safeFetch`, which imports `node:dns` lookup and
 *    undici's `Agent`. Neither exists in workerd, so it threw and surfaced as a
 *    FileRetrievalError. Locally Node provides both, which is exactly why this
 *    was invisible in dev. `skipSafeFetch` routes it through plain `fetch`.
 * 2. `crop` defaults to true, so the admin rendered a Crop tab even though the
 *    code comment said crop was disabled. Cropping needs sharp
 *    (`if (cropData && sharp)`), and sharp is undefined on the Worker, so a
 *    crop silently did nothing.
 *
 * These assert configuration rather than behaviour because the whole failure
 * WAS the configuration — and it cannot be caught locally, where the Node
 * built-ins that workerd lacks are all present.
 */
import { describe, expect, it } from 'vitest'

import { Media } from '../../src/collections/Media'

const upload = () => {
  expect(Media.upload, 'Media must stay an upload collection').toBeTruthy()
  return Media.upload as Exclude<typeof Media.upload, boolean | undefined>
}

describe('image settings must be editable on the Worker', () => {
  it('skips safeFetch, which needs node:dns and undici (absent in workerd)', () => {
    // Without this, changing the focal point fails on accp but not in dev.
    expect(upload().skipSafeFetch).toBeTruthy()
  })

  it('keeps the focal point selector enabled', () => {
    // focalPoint: true is what makes the selector appear at all — see
    // showFocalPoint in @payloadcms/ui Upload/index.js.
    expect(upload().focalPoint).toBe(true)
  })

  it('disables the crop tool, which cannot work without sharp', () => {
    // Explicitly false, not merely absent: absent means Payload's default of
    // true, which renders a Crop tab that silently discards the crop.
    expect(upload().crop).toBe(false)
  })

  it('defines no imageSizes, so no request needs sharp to resize', () => {
    // Framing is done in the browser (object-position from the focal point).
    // Adding imageSizes would put sharp back on the request path and break
    // uploads on the Worker entirely.
    expect(upload().imageSizes).toBeUndefined()
  })
})

describe('media stays publicly readable', () => {
  it('allows public read so the static frontend can fetch files', () => {
    expect(Media.access?.read?.({} as never)).toBe(true)
  })
})
