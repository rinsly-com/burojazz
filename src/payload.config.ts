import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig, type Plugin } from 'payload'
import { fileURLToPath } from 'url'
import { type CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import type { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Comments } from './collections/Comments'
import { Aanmeldingen } from './collections/Aanmeldingen'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { cloudflareEmailAdapter } from './lib/email'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

// True when running the Payload CLI (e.g. `payload migrate`), where there is no
// Workers runtime and bindings must come from wrangler's platform proxy instead.
const isCLI = process.argv.some((value) => realpath(value)?.endsWith(path.join('payload', 'bin.js')))
const isProduction = process.env.NODE_ENV === 'production'

// Payload's default logger uses pino-pretty, which relies on Node APIs that are
// not available in the Workers runtime. In production route logs through console.*.
const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as any // Use PayloadLogger type when it's exported

// In the Worker we read bindings from the live Cloudflare context. Locally and
// under the CLI we spin up wrangler's platform proxy so the same config works.
const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

// R2 is prepared but optional: only wire the storage adapter when an R2 binding
// actually exists. Without it, uploads fall back to the local filesystem in dev.
const env = cloudflare.env as unknown as Record<string, unknown>
const plugins: Plugin[] = []
if (env.R2) {
  plugins.push(
    r2Storage({
      bucket: env.R2 as never,
      collections: { media: true },
    }),
  )
}

// sharp is a native module (libvips) used by Payload to apply image crop/resize.
// The Cloudflare Workers runtime can't load native addons, so load it only in
// Node (local dev + the Payload CLI); on the Worker (accp) it stays undefined and
// image processing is simply skipped. The specifier is obfuscated so the Worker
// bundle never includes it — same guard used for the wrangler proxy above.
const sharp =
  isCLI || !isProduction
    ? ((await import(/* webpackIgnore: true */ `${'__sharp'.replaceAll('_', '')}`)) as { default: unknown })
        .default
    : undefined

// Origins allowed to call the API from a browser. The public production site is
// a SEPARATE static deployment (burojazz-prod), so its origin must be allow-listed
// for the "Direct aanmelden" form to POST cross-origin to this Payload worker.
// Set FRONTEND_URL (comma-separated allowed) in the accp environment.
const frontendOrigins = (process.env.FRONTEND_URL || 'https://burojazz.com')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)
const corsOrigins = Array.from(new Set([...frontendOrigins, 'http://localhost:3000']))

export default buildConfig({
  sharp: sharp as never,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages, Comments, Aanmeldingen],
  globals: [Header, Footer],
  cors: corsOrigins,
  csrf: corsOrigins,
  email: cloudflareEmailAdapter,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({ binding: cloudflare.env.D1 }),
  logger: isProduction ? cloudflareLogger : undefined,
  plugins,
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/main/packages/cloudflare/src/api/cloudflare-context.ts
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction,
      } satisfies GetPlatformProxyOptions),
  )
}
