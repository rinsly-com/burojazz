// Authenticate to the private GitHub Packages registry for CI builds
// (Cloudflare Builds), so `pnpm install` can fetch @rinsly-com/site-core.
//
// Runs as the `preinstall` lifecycle script — before pnpm fetches dependencies.
// pnpm deliberately IGNORES `${ENV}`-style auth tokens in a committed .npmrc (a
// security measure), so the token has to be written as a LITERAL. It comes from
// the NODE_AUTH_TOKEN build env var (a GitHub PAT with `read:packages`), which is
// never committed. No-op locally where NODE_AUTH_TOKEN is unset (developers use
// their own ~/.npmrc / `gh auth`). Idempotent.
import { appendFileSync, readFileSync } from 'node:fs'

const token = process.env.NODE_AUTH_TOKEN
if (token) {
  let current = ''
  try {
    current = readFileSync('.npmrc', 'utf8')
  } catch {
    /* no .npmrc yet — fine */
  }
  if (!current.includes('npm.pkg.github.com/:_authToken')) {
    appendFileSync(
      '.npmrc',
      `\n@rinsly-com:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${token}\n`,
    )
    console.log('[ci-npmrc-auth] wrote GitHub Packages auth token to .npmrc')
  }
}
