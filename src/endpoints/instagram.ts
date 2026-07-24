import type { PayloadHandler } from 'payload'

import { getLatestInstagramPost } from '@/lib/instagram'

/**
 * GET /api/instagram/latest — public, unauthenticated. Returns the most recent
 * @buro.jazz post so the static production site can render it client-side
 * (cross-origin; CORS is configured for burojazz.com in site.config.ts).
 *
 * Always 200: `{ post: <post> | null }`. `null` means the integration isn't
 * configured or Instagram is unreachable, and the frontend shows the static
 * phone mockup instead. A short CDN cache header lets Cloudflare absorb bursts;
 * the underlying data is already KV-cached (see lib/instagram.ts).
 */
export const instagramLatestHandler: PayloadHandler = async (): Promise<Response> => {
  const post = await getLatestInstagramPost()
  return Response.json(
    { post },
    { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } },
  )
}
