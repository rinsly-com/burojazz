import path from 'path'
import { fileURLToPath } from 'url'

import { buildSiteConfig } from '@rinsly-com/site-core/config'
import { siteConfig } from '@/site.config'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Comments } from './collections/Comments'
import { Aanmeldingen } from './collections/Aanmeldingen'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { AanmeldingInstellingen } from './globals/AanmeldingInstellingen'
import { cloudflareEmailAdapter } from './lib/email'
import { deployHandler } from './endpoints/deploy'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Buro J.A.Z.Z. Payload config. The shared engine (@rinsly-com/site-core) provides
 * the Cloudflare/D1/R2 plumbing, logger, sharp handling, SEO plugin and CORS; here
 * we keep this site's OWN content model (single-language Dutch, editorial workflow,
 * the aanmelding intake) plus its email adapter and the production Deploy button.
 */
export default buildSiteConfig({
  siteConfig,
  // This site owns its full content model (single-language, workflow, intake).
  collections: [Users, Media, Pages, Comments, Aanmeldingen],
  globals: [Header, Footer, AanmeldingInstellingen],
  localization: false, // content is Dutch-only (admin i18n nl/en stays on)
  email: cloudflareEmailAdapter,
  // POST /api/deploy — manual "rebuild production" trigger (endpoints/deploy.ts).
  extraEndpoints: [{ path: '/deploy', method: 'post', handler: deployHandler }],
  // Sidebar link + custom view for the manual production static deploy.
  adminComponents: {
    afterNavLinks: ['/components/DeployNavLink#DeployNavLink'],
    views: {
      deploy: { Component: '/components/DeployView#DeployView', path: '/deploy' },
    },
  },
  importMapBaseDir: path.resolve(dirname),
  typesOutputFile: path.resolve(dirname, 'payload-types.ts'),
})
