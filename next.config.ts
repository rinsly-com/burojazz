import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// When BUILD_STATIC=true we produce the fully static production site
// (`next export` -> out/). In that mode the Payload admin/API route group is
// removed by scripts/build-static.mjs, so we skip withPayload and emit a plain
// static frontend with no server runtime.
const isStatic = process.env.BUILD_STATIC === 'true'

const nextConfig: NextConfig = {
  // The shared engine (@rinsly-com/site-core, used by payload.config) ships as
  // TypeScript source; Next must transpile it.
  transpilePackages: ['@rinsly-com/site-core'],
  images: {
    // Static export cannot use the Next image optimizer.
    unoptimized: isStatic,
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  // Packages with Cloudflare Workers (workerd) specific code.
  // https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: ['jose', 'pg-cloudflare'],
  // The static build uses its own dist dir so it can run while the dev server
  // (which owns .next and serves the content API it fetches from) stays up.
  ...(isStatic ? { output: 'export' as const, distDir: '.next-static' } : {}),
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default isStatic ? nextConfig : withPayload(nextConfig, { devBundleServerPackages: false })
