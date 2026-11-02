/**
 * Response headers shared by the static production site and the accp worker.
 *
 * Production (Workers Assets) sends them from public/_headers, next to the
 * CSP, on `/*`. Accp is OpenNext: _headers does not apply to Worker-rendered
 * responses, and next.config had no headers() and there is no middleware, so
 * accp sent none of these. `accpSecurityHeaders()` is what next.config
 * returns for every non-static route.
 *
 * X-Frame-Options differs. The static site already has CSP
 * `frame-ancestors 'none'` and has no admin, so DENY. Accp's Payload live
 * preview iframes the site on the same origin (`/?preview=1`,
 * `/[slug]?preview=1` from `previewPath`). DENY would blank that iframe.
 * SAMEORIGIN still refuses cross-origin framing. The static CSP is not
 * copied onto accp: `frame-ancestors 'none'` would blank the preview even
 * with SAMEORIGIN.
 *
 * Permissions-Policy locks camera, microphone, geolocation, and the retired
 * FLoC cohort. The public site uses none of them (no maps embed; forms are
 * first-party plus a Turnstile iframe). HSTS has no `preload`.
 */

export type SecurityHeader = { key: string; value: string }

/** No `preload`. */
export const STRICT_TRANSPORT_SECURITY = 'max-age=31536000; includeSubDomains'

export const X_CONTENT_TYPE_OPTIONS = 'nosniff'

export const REFERRER_POLICY = 'strict-origin-when-cross-origin'

export const PERMISSIONS_POLICY = 'camera=(), microphone=(), geolocation=(), interest-cohort=()'

/** Static production site. Matches CSP `frame-ancestors 'none'`. */
export const STATIC_X_FRAME_OPTIONS = 'DENY'

/**
 * Accp OpenNext worker. Live preview iframes the frontend from /admin on
 * this same origin; DENY would block it.
 */
export const ACCP_X_FRAME_OPTIONS = 'SAMEORIGIN'

export function securityHeaders(xFrameOptions: string): SecurityHeader[] {
  return [
    { key: 'Strict-Transport-Security', value: STRICT_TRANSPORT_SECURITY },
    { key: 'X-Content-Type-Options', value: X_CONTENT_TYPE_OPTIONS },
    { key: 'Referrer-Policy', value: REFERRER_POLICY },
    { key: 'Permissions-Policy', value: PERMISSIONS_POLICY },
    { key: 'X-Frame-Options', value: xFrameOptions },
  ]
}

/** `headers()` entries for the accp worker. Not used by `output: 'export'`. */
export function accpSecurityHeaders(): { source: string; headers: SecurityHeader[] }[] {
  return [
    {
      // `/:path*` matches `/` as well as every nested route, including /admin and /api.
      source: '/:path*',
      headers: securityHeaders(ACCP_X_FRAME_OPTIONS),
    },
  ]
}
