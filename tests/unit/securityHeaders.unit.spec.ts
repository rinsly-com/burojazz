/**
 * Security headers for static production (public/_headers) and accp (next.config).
 *
 * REGRESSION: Workers Assets production sent only Content-Security-Policy.
 * HSTS, nosniff, referrer policy, permissions policy, and X-Frame-Options
 * were absent. Accp's OpenNext path (no headers(), no middleware) sent none.
 * X-Frame-Options on accp must stay SAMEORIGIN: Payload live preview iframes
 * /?preview=1 on the same origin as /admin, and DENY blanks that iframe.
 * The static CSP stays byte-for-byte; it is not copied onto accp because
 * frame-ancestors 'none' would blank the preview even with SAMEORIGIN.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  ACCP_X_FRAME_OPTIONS,
  PERMISSIONS_POLICY,
  REFERRER_POLICY,
  STATIC_X_FRAME_OPTIONS,
  STRICT_TRANSPORT_SECURITY,
  X_CONTENT_TYPE_OPTIONS,
  accpSecurityHeaders,
  securityHeaders,
} from '@/lib/securityHeaders'

const CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://accp.burojazz.com https://*.cdninstagram.com https://*.fbcdn.net; font-src 'self' data:; connect-src 'self' https://accp.burojazz.com https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://accp.burojazz.com; object-src 'none'"

type HeaderRule = { pattern: string; headers: [string, string][] }

function parseHeadersFile(source: string): HeaderRule[] {
  const rules: HeaderRule[] = []
  let current: HeaderRule | null = null
  for (const line of source.split('\n')) {
    if (line.startsWith('#') || line.trim() === '') continue
    if (!line.startsWith(' ') && !line.startsWith('\t')) {
      current = { pattern: line.trim(), headers: [] }
      rules.push(current)
      continue
    }
    const colon = line.indexOf(':')
    if (!current || colon === -1) throw new Error(`header line outside a rule: ${line}`)
    current.headers.push([line.slice(0, colon).trim(), line.slice(colon + 1).trim()])
  }
  return rules
}

const headersFile = readFileSync(path.join(process.cwd(), 'public/_headers'), 'utf8')
const nextConfigSource = readFileSync(path.join(process.cwd(), 'next.config.ts'), 'utf8')

describe('public/_headers security headers', () => {
  const star = parseHeadersFile(headersFile).find((rule) => rule.pattern === '/*')

  it('keeps the Content-Security-Policy byte-for-byte on /*', () => {
    expect(star).toBeDefined()
    expect(star!.headers[0]).toEqual(['Content-Security-Policy', CSP])
    expect(headersFile).toContain(`  Content-Security-Policy: ${CSP}\n`)
  })

  it('adds HSTS (no preload), nosniff, referrer policy, permissions policy, and DENY', () => {
    expect(star!.headers.slice(1)).toEqual([
      ['Strict-Transport-Security', STRICT_TRANSPORT_SECURITY],
      ['X-Content-Type-Options', X_CONTENT_TYPE_OPTIONS],
      ['Referrer-Policy', REFERRER_POLICY],
      ['Permissions-Policy', PERMISSIONS_POLICY],
      ['X-Frame-Options', STATIC_X_FRAME_OPTIONS],
    ])
    expect(STRICT_TRANSPORT_SECURITY).toBe('max-age=31536000; includeSubDomains')
    expect(STRICT_TRANSPORT_SECURITY).not.toMatch(/preload/i)
    expect(X_CONTENT_TYPE_OPTIONS).toBe('nosniff')
    expect(REFERRER_POLICY).toBe('strict-origin-when-cross-origin')
    expect(STATIC_X_FRAME_OPTIONS).toBe('DENY')
    expect(PERMISSIONS_POLICY).toBe('camera=(), microphone=(), geolocation=(), interest-cohort=()')
  })

  it('does not put Cache-Control on /* (that would clobber the asset rules)', () => {
    expect(star!.headers.map(([name]) => name)).not.toContain('Cache-Control')
  })
})

describe('accp OpenNext headers()', () => {
  it('sends the same set on every route, with SAMEORIGIN instead of DENY, and no CSP', () => {
    expect(accpSecurityHeaders()).toEqual([
      {
        source: '/:path*',
        headers: securityHeaders('SAMEORIGIN'),
      },
    ])
    const headers = accpSecurityHeaders()[0].headers
    expect(headers.map((header) => header.key)).not.toContain('Content-Security-Policy')
    expect(headers.find((header) => header.key === 'X-Frame-Options')?.value).toBe(
      ACCP_X_FRAME_OPTIONS,
    )
    expect(ACCP_X_FRAME_OPTIONS).toBe('SAMEORIGIN')
    expect(headers.find((header) => header.key === 'Strict-Transport-Security')?.value).not.toMatch(
      /preload/i,
    )
  })

  it('is wired from next.config only when the build is not the static export', () => {
    expect(nextConfigSource).toMatch(/headers:.*accpSecurityHeaders\(\)/)
    expect(nextConfigSource).toContain("? { output: 'export' as const, distDir: '.next-static' }")
  })
})
