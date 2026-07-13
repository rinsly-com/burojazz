import { ImageResponse } from 'next/og'

// Apple touch icon (iOS home screen). Generated so no source asset is needed —
// brand teal field with the ink wordmark. Prerenders to a PNG in the static
// export; runs on next/og on the accp worker.
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'
// Image route handlers are not static-by-default under `output: export`
// (Next 16); the icon is fixed, so force-static prerenders it to a PNG.
export const dynamic = 'force-static'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#51c2cc',
          color: '#291f09',
          fontSize: 46,
          fontWeight: 800,
          letterSpacing: 2,
          fontFamily: 'sans-serif',
        }}
      >
        JAZZ
      </div>
    ),
    size,
  )
}
