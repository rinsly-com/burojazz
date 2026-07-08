// Build the fully static production site (out/) from the public (frontend)
// routes only. Payload's admin + API route group and the sample custom route
// are server-only and would block `next export`, so we temporarily move them
// out of the app tree, run the static build, then always restore them.
//
// Content is fetched at build time from the accp Payload API via PAYLOAD_API_URL.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const backupDir = path.join(root, '.static-build-backup')

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

// Clean up any leftovers from a previously interrupted run before we start.
if (existsSync(backupDir)) restore()

rmSync(path.join(root, 'out'), { recursive: true, force: true })
rmSync(path.join(root, '.next'), { recursive: true, force: true })

try {
  stash()
  execFileSync('pnpm', ['exec', 'next', 'build'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      BUILD_STATIC: 'true',
      NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --no-deprecation`.trim(),
    },
  })
} finally {
  restore()
}

console.log('\n✔ Static site built to ./out')
