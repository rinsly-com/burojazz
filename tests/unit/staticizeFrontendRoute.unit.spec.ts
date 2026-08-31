/**
 * Static-export rewrite of frontend routes (scripts/staticizeFrontendRoute.mjs).
 *
 * REGRESSION: build-static.mjs rewrote
 *   const loadPreviewShell: (…) | undefined = () => import(…)
 * to bare `const loadPreviewShell = undefined`. Under BUILD_STATIC, next build
 * typechecks that file; TS inferred `undefined`, narrowed `if (loadPreviewShell)`
 * to `never`, and failed the 2026-08-31 prod deploy with "Type 'never' has no
 * call signatures" on loadPreviewShell(). The rewrite must keep the type.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { staticizeFrontendRouteSource } from '../../scripts/staticizeFrontendRoute.mjs'

const slugPage = readFileSync(
  path.join(process.cwd(), 'src/app/(frontend)/[slug]/page.tsx'),
  'utf8',
)

describe('staticizeFrontendRouteSource', () => {
  it('keeps a typed loadPreviewShell = undefined (not a bare undefined)', () => {
    const out = staticizeFrontendRouteSource(slugPage)

    expect(out).not.toMatch(/\(\)\s*=>\s*import\('@\/components\/PreviewShell'\)/)
    expect(out).toMatch(
      /const loadPreviewShell:\s*\(\(\) => Promise<typeof import\('@\/components\/PreviewShell'\)>\)\s*\|\s*undefined\s*=\s*undefined/,
    )
    // The bug: untyped assignment that collapses to `never` after the guard.
    expect(out).not.toMatch(/^const loadPreviewShell = undefined$/m)
  })

  it('strips force-dynamic and pins dynamicParams false', () => {
    const out = staticizeFrontendRouteSource(slugPage)
    expect(out).not.toMatch(/export const dynamic = ['"]force-dynamic['"]/)
    expect(out).toMatch(/export const dynamicParams = false/)
  })
})
