/**
 * Build-time content snapshot for the static production build.
 *
 * scripts/build-static.mjs pre-fetches all published content into a snapshot
 * dir BEFORE stashing the (payload) API routes (locally, stashing would break
 * the very dev server the build fetches from). During `next build` the data
 * layer reads from this dir (CONTENT_SNAPSHOT env) instead of HTTP.
 *
 * The fs import is dynamic and only ever runs when CONTENT_SNAPSHOT is set —
 * i.e. at build time in Node — so this module stays safe for the Workers
 * runtime (accp), where the env var is never set.
 */
export async function readSnapshot<T>(name: string): Promise<T | null> {
  const dir = process.env.CONTENT_SNAPSHOT
  if (!dir) return null
  try {
    const { readFileSync } = await import('node:fs')
    const path = await import('node:path')
    return JSON.parse(readFileSync(path.join(dir, `${name}.json`), 'utf8')) as T
  } catch {
    return null
  }
}
