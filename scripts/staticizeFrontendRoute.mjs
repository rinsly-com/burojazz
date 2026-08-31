/**
 * Transforms a (frontend) route source for `output: export`.
 *
 * Accp keeps `force-dynamic` + a live `loadPreviewShell` import. The static
 * production build must strip dynamic routing and drop the PreviewShell loader
 * so the client icon/block barrel is not shipped to every visitor.
 */
export function staticizeFrontendRouteSource(src) {
  return src
    .replace(/^export const dynamic = ['"]force-dynamic['"].*\n?/m, '')
    .replace(/^export const dynamicParams = true\b.*$/m, 'export const dynamicParams = false')
    .replace(
      // Keep the type annotation. Rewriting to bare `const loadPreviewShell =
      // undefined` made TS infer `undefined`, so `if (loadPreviewShell)`
      // narrowed to `never` and `next build` failed typecheck (burojazz prod
      // 2026-08-31).
      /const loadPreviewShell:([\s\S]*?)=\s*\(\)\s*=>\s*import\('@\/components\/PreviewShell'\)/,
      'const loadPreviewShell:$1= undefined',
    )
}
