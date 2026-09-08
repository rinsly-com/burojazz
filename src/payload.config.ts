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
import { instagramLatestHandler } from './endpoints/instagram'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Buro J.A.Z.Z. Payload config. The shared engine (@rinsly-com/site-core) provides
 * the Cloudflare/D1/R2 plumbing, logger, sharp handling, SEO plugin and CORS; here
 * we keep this site's OWN content model (single-language Dutch, editorial workflow,
 * the aanmelding intake) plus its email adapter and the production Deploy button.
 */
export default buildSiteConfig({
  siteConfig,
  // Accp origin for forgot-password links.
  serverURL: process.env.PAYLOAD_SERVER_URL || 'https://accp.burojazz.com',
  // This site owns its full content model (single-language, workflow, intake).
  collections: [Users, Media, Pages, Comments, Aanmeldingen],
  globals: [Header, Footer, AanmeldingInstellingen],
  localization: false, // content is Dutch-only (admin i18n nl/en stays on)
  email: cloudflareEmailAdapter,
  // POST /api/deploy — manual "rebuild production" trigger (endpoints/deploy.ts).
  // GET /api/instagram/latest — latest @buro.jazz post for the social block.
  extraEndpoints: [
    { path: '/deploy', method: 'post', handler: deployHandler },
    { path: '/instagram/latest', method: 'get', handler: instagramLatestHandler },
  ],
  // Sidebar link + custom view for the manual production static deploy.
  adminComponents: {
    afterNavLinks: ['/components/DeployNavLink#DeployNavLink'],
    views: {
      deploy: { Component: '/components/DeployView#DeployView', path: '/deploy' },
    },
  },
  importMapBaseDir: path.resolve(dirname),
  typesOutputFile: path.resolve(dirname, 'payload-types.ts'),
  // Cloudflare traffic strip on the dashboard (unique visitors / page views).
  // Needs the src/components/AnalyticsPanel.tsx re-export plus
  // CLOUDFLARE_ZONE_ID + CLOUDFLARE_ANALYTICS_TOKEN; without those it renders
  // nothing on a live site.
  dashboardAnalytics: true,
  // Rinsly's uptime monitor on the dashboard: up right now, the measured
  // 30/90-day percentages, and a 90-day per-day strip. The uptime Worker
  // already watches this domain (Ledger pushes every active client), so the
  // only per-site steps are this flag and RINSLY_UPTIME_TOKEN as a secret on
  // the accp + prod Workers. Without the token the panel renders nothing, so
  // enabling it before the secret exists is harmless.
  dashboardUptime: true,
  // Last media-backup widget: last successful `rinsly-backups` run for this
  // site, plus the fixed D1 Time Travel line. Needs the RinslyAdmin barrel's
  // BackupsPanel re-export plus RINSLY_BACKUPS_TOKEN + RINSLY_BACKUPS_SITE on
  // the accp + prod Workers. Without them the panel renders nothing.
  dashboardBackups: true,
  // TOTP two-factor authentication: login code field, /admin/two-factor
  // enrolment screen, and admins are steered into enrolling (never locked
  // out). Needs the src/components/TotpAuth.tsx re-export. This is what makes
  // the DPA's "tweefactorauthenticatie voor beheertoegang" sentence true.
  totp: { require: 'admin' },
})
