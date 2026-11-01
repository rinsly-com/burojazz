/**
 * Double-dash psycholoog URL → single-dash, on both hosts.
 *
 * REGRESSION: `/psycholoog--orthopedagoog` was a published path. Production
 * is Workers Assets (`out/` from the static export) and does not run
 * `next.config` redirects. Accp is an OpenNext worker, and Workers Assets
 * does not apply `_redirects` to requests that worker serves. Both layers
 * have to 301, including the trailing-slash form, because static assets use
 * `html_handling: auto-trailing-slash` and Next strips trailing slashes
 * itself unless the slash rule is priority.
 */
import { existsSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  nextPermanentRedirects,
  workersAssetsRedirectLines,
} from '@/lib/permanentRedirects'

const REDIRECT_LINES = [
  '/psycholoog--orthopedagoog /psycholoog-orthopedagoog 301',
  '/psycholoog--orthopedagoog/ /psycholoog-orthopedagoog 301',
]

describe('psycholoog orthopedagoog permanent redirects', () => {
  it('301s both slash forms to the single-dash path', () => {
    expect(workersAssetsRedirectLines()).toBe(`${REDIRECT_LINES.join('\n')}\n`)
    expect(
      nextPermanentRedirects().map(
        (rule) => `${rule.source} ${rule.destination} ${rule.statusCode}`,
      ),
    ).toEqual(REDIRECT_LINES)
    expect(nextPermanentRedirects()[1]?.priority).toBe(true)
    expect(nextPermanentRedirects()[0]?.priority).toBeUndefined()
  })

  it('ships those lines in public/_redirects for the static asset build', () => {
    expect(readFileSync('public/_redirects', 'utf8')).toBe(workersAssetsRedirectLines())
  })

  it('wires the same rules into next.config redirects()', () => {
    const source = readFileSync('next.config.ts', 'utf8')
    expect(source).toContain('async redirects()')
    expect(source).toContain('nextPermanentRedirects()')
  })

  it('does not exclude _redirects from the static Workers Assets directory', () => {
    // Wrangler reads out/_redirects as metadata even though it omits the file
    // from the public asset manifest. An exclude, or a .assetsignore entry,
    // is the way that file would stop being deployed with the site.
    expect(existsSync('public/.assetsignore')).toBe(false)
    expect(existsSync('.assetsignore')).toBe(false)

    const raw = readFileSync('wrangler.static.jsonc', 'utf8')
    const stripped = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      // jsonc allows trailing commas; this file uses them.
      .replace(/,\s*([}\]])/g, '$1')
    expect(stripped).not.toContain('_redirects')
    expect(stripped).not.toContain('assetsignore')

    const config = JSON.parse(stripped) as {
      assets?: { directory?: string; html_handling?: string; exclude?: unknown }
    }
    expect(config.assets?.directory).toBe('out')
    expect(config.assets?.html_handling).toBe('auto-trailing-slash')
    expect(config.assets?.exclude).toBeUndefined()
  })
})
