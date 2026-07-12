// Build the fully static production site (out/) from the public (frontend)
// routes only. Payload's admin + API route group and the sample custom route
// are server-only and would block `next export`, so we temporarily move them
// out of the app tree, run the static build, then always restore them.
//
// Content is SNAPSHOTTED from the Payload API (PAYLOAD_API_URL) BEFORE the
// stash: locally the API is the dev server on this same source tree, so
// stashing the (payload) routes would otherwise break the very API the build
// fetches from mid-build. The data layer reads the snapshot during the build
// via the CONTENT_SNAPSHOT env var (see src/lib/contentSnapshot.ts).
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const backupDir = path.join(root, '.static-build-backup')
const snapshotDir = path.join(root, '.static-content')
const API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3000'

// Server-only paths to hide during the static export.
const EXCLUDED = [
  { live: 'src/app/(payload)', stashed: 'app__payload' },
  { live: 'src/app/my-route', stashed: 'app__my-route' },
]

const stash = () => {
  mkdirSync(backupDir, { recursive: true })
  for (const { live, stashed } of EXCLUDED) {
    const from = path.join(root, live)
    if (existsSync(from)) renameSync(from, path.join(backupDir, stashed))
  }
}

const restore = () => {
  for (const { live, stashed } of EXCLUDED) {
    const from = path.join(backupDir, stashed)
    if (existsSync(from)) renameSync(from, path.join(root, live))
  }
  rmSync(backupDir, { recursive: true, force: true })
}

const fetchJson = async (url) => {
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`)
  return res.json()
}

// Pre-fetch all published content into the snapshot dir.
const snapshotContent = async () => {
  rmSync(snapshotDir, { recursive: true, force: true })
  mkdirSync(snapshotDir, { recursive: true })
  const write = (name, data) =>
    writeFileSync(path.join(snapshotDir, `${name}.json`), JSON.stringify(data))

  const index = await fetchJson(
    `${API_URL}/api/pages?where[_status][equals]=published&limit=200&depth=0`,
  )
  const pages = index.docs ?? []
  write('pages-index', pages)

  for (const page of pages) {
    const detail = await fetchJson(
      `${API_URL}/api/pages?where[and][0][slug][equals]=${encodeURIComponent(
        page.slug,
      )}&where[and][1][_status][equals]=published&limit=1&depth=1`,
    )
    write(`page-${page.slug}`, detail.docs?.[0] ?? null)
  }

  for (const slug of ['header', 'footer']) {
    try {
      write(`global-${slug}`, await fetchJson(`${API_URL}/api/globals/${slug}?depth=1`))
    } catch {
      write(`global-${slug}`, null)
    }
  }

  console.log(`✔ Snapshotted ${pages.length} published page(s) + globals from ${API_URL}`)
}

// Clean up any leftovers from a previously interrupted run before we start.
if (existsSync(backupDir)) restore()

rmSync(path.join(root, 'out'), { recursive: true, force: true })
// The static build has its own dist dir (see next.config.ts) so the running
// dev server's .next is never touched.
rmSync(path.join(root, '.next-static'), { recursive: true, force: true })

try {
  await snapshotContent()
} catch (err) {
  console.warn(`⚠ Content snapshot failed (${err.message}) — build will fetch over HTTP instead.`)
}

try {
  stash()
  execFileSync('pnpm', ['exec', 'next', 'build'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      BUILD_STATIC: 'true',
      CONTENT_SNAPSHOT: snapshotDir,
      NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --no-deprecation`.trim(),
    },
  })
} finally {
  restore()
  rmSync(snapshotDir, { recursive: true, force: true })
}

// With a custom distDir, Next writes the export into the distDir itself —
// move it to out/, which wrangler.static.jsonc serves.
if (existsSync(path.join(root, '.next-static', 'index.html'))) {
  renameSync(path.join(root, '.next-static'), path.join(root, 'out'))
}

console.log('\n✔ Static site built to ./out')
