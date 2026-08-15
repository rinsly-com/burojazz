/**
 * Generate AVIF and WebP siblings for every raster in public/images.
 *
 * CMS uploads are already resized and re-encoded at the edge by Cloudflare
 * Image Transformations (see lib/image.ts). The design assets in public/ are
 * not: they are served exactly as authored, which is how a 641x828 avatar
 * reached visitors as a 391 KB PNG.
 *
 * This writes `photo.jpg` -> `photo.avif` + `photo.webp` beside the original.
 * The original stays as the final fallback in <picture>, so nothing breaks if a
 * browser supports neither and nothing breaks if this script has not been run.
 *
 * Naming is deterministic on purpose: `Media` derives the sibling paths by
 * swapping the extension rather than checking the filesystem, so it stays a
 * plain Server Component with no fs access and no manifest to keep in sync.
 *
 * Idempotent: a variant newer than its source is left alone, so re-running is
 * cheap and it can sit in front of the build.
 *
 *   pnpm optimize:images          # convert what has changed
 *   pnpm optimize:images --force  # redo everything
 */
import { readdir, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..', 'public', 'images')
const FORCE = process.argv.includes('--force')

/** Nothing on this site is displayed wider than this; hero photos are the cap. */
const MAX_WIDTH = 1600

async function* rasters(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* rasters(full)
    else if (/\.(jpe?g|png)$/i.test(entry.name)) yield full
  }
}

const fresh = async (src, out) => {
  if (FORCE || !existsSync(out)) return false
  const [a, b] = await Promise.all([stat(src), stat(out)])
  return b.mtimeMs >= a.mtimeMs
}

let before = 0
let after = 0
let made = 0
let skipped = 0

for await (const src of rasters(ROOT)) {
  const meta = await sharp(src).metadata()
  const width = Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH)
  const original = (await stat(src)).size
  before += original

  let smallest = original
  for (const [ext, encode] of [
    // Quality picked per format rather than shared: AVIF holds up far lower
    // than WebP at the same perceived quality.
    ['avif', (p) => p.avif({ quality: 55 })],
    ['webp', (p) => p.webp({ quality: 80 })],
  ]) {
    const out = src.replace(/\.(jpe?g|png)$/i, `.${ext}`)
    if (await fresh(src, out)) {
      skipped++
      smallest = Math.min(smallest, (await stat(out)).size)
      continue
    }
    const buf = await encode(
      sharp(src).resize({ width, withoutEnlargement: true }),
    ).toBuffer()
    await writeFile(out, buf)
    made++
    smallest = Math.min(smallest, buf.length)
  }
  after += smallest
}

const kb = (n) => `${(n / 1024).toFixed(0)} KB`
console.log(
  `images: ${made} written, ${skipped} already current\n` +
    `  originals      ${kb(before)}\n` +
    `  best variant   ${kb(after)}  (${(100 - (after / before) * 100).toFixed(0)}% smaller)`,
)
