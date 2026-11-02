/**
 * Instagram "latest post" integration.
 *
 * The public production site is a static snapshot, so it fetches the most recent
 * @buro.jazz post client-side from this worker's `/api/instagram/latest`
 * endpoint (same cross-origin pattern as the aanmelden form). This module holds
 * the server-side logic: it talks to the Instagram Graph API, caches the result
 * in KV so we don't hit the API (or its rate limits) on every visitor, and
 * lazily refreshes the long-lived access token as it ages.
 *
 * Instagram Basic Display was shut off on 2024-12-04; this uses the Graph API
 * ("Instagram API with Instagram Login"), which requires @buro.jazz to be a
 * Business/Creator account connected to a Meta app. See docs/INSTAGRAM.md for
 * the one-time setup and how the token is provisioned.
 *
 * When no token is configured (or anything fails) every function degrades to
 * `null`, and the frontend falls back to the static phone mockup.
 */

import { envOptionalSecret } from './env'
import { LogCode, logCode } from './logCode'
import {
  instagramCacheSchema,
  instagramMediaSchema,
  instagramRefreshSchema,
  mediaNodeToPost,
  type InstagramPost,
} from './instagramPost'

const GRAPH = 'https://graph.instagram.com'

/** KV keys. */
const KEY_TOKEN = 'ig:token'
const KEY_TOKEN_REFRESHED_AT = 'ig:token_refreshed_at'
const KEY_CACHE = 'ig:latest'

/** Serve the cached post for this long before refetching from Instagram. */
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 min
/** Refresh the long-lived token once it is older than this (tokens last 60d). */
const TOKEN_REFRESH_AFTER_MS = 24 * 24 * 60 * 60 * 1000 // 24 days

/** Minimal KV binding surface we rely on. */
type KVNamespace = {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
}

/** Resolve the INSTAGRAM_KV binding at runtime, or null outside the Worker. */
async function getKV(): Promise<KVNamespace | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const ctx = await getCloudflareContext({ async: true })
    const binding = (ctx.env as unknown as Record<string, unknown>).INSTAGRAM_KV
    return binding && typeof (binding as KVNamespace).get === 'function'
      ? (binding as KVNamespace)
      : null
  } catch {
    logCode('warn', LogCode.INSTAGRAM_KV_UNAVAILABLE)
    return null
  }
}

/**
 * Current access token. Prefers the (refreshable) value in KV, falling back to
 * the INSTAGRAM_ACCESS_TOKEN secret used to seed it on first run. Returns null
 * when neither is set — the signal that the integration isn't configured yet.
 */
async function getToken(kv: KVNamespace | null): Promise<string | null> {
  const fromKv = kv ? await kv.get(KEY_TOKEN) : null
  return fromKv || envOptionalSecret('INSTAGRAM_ACCESS_TOKEN') || null
}

/**
 * Extend the long-lived token's validity if it is getting old. Refresh only
 * works on tokens 24h–60d old, so we run it well inside that window on normal
 * traffic (no cron needed). Failures are swallowed: a still-valid token keeps
 * working, and a fully-expired one just falls back to the static mockup.
 */
async function maybeRefreshToken(kv: KVNamespace, token: string): Promise<string> {
  const refreshedAtRaw = await kv.get(KEY_TOKEN_REFRESHED_AT)
  const refreshedAt = refreshedAtRaw ? Number(refreshedAtRaw) : 0
  const now = Date.now()
  if (refreshedAt && now - refreshedAt < TOKEN_REFRESH_AFTER_MS) return token

  let status: number | undefined
  try {
    const url = `${GRAPH}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(
      token,
    )}`
    const res = await fetch(url)
    status = res.status
    if (!res.ok) throw new Error('refresh http')
    const json = instagramRefreshSchema.safeParse((await res.json()) as unknown)
    if (!json.success) throw new Error('refresh shape')
    await kv.put(KEY_TOKEN, json.data.access_token)
    await kv.put(KEY_TOKEN_REFRESHED_AT, String(now))
    return json.data.access_token
  } catch {
    // Record the attempt so we don't retry on every request; the existing token
    // is very likely still valid (refresh only fails at the edges of the window).
    // The URL contains the access token, so the raw error is never logged.
    logCode('warn', LogCode.INSTAGRAM_TOKEN_REFRESH_FAILED, status === undefined ? undefined : { status })
    await kv.put(KEY_TOKEN_REFRESHED_AT, String(now))
    return token
  }
}

/**
 * The most recent @buro.jazz post, cached in KV. Returns null when the
 * integration is unconfigured or the API call fails, so callers can fall back.
 */
export async function getLatestInstagramPost(): Promise<InstagramPost | null> {
  const kv = await getKV()

  // Serve a fresh-enough cached value without touching Instagram.
  if (kv) {
    const cachedRaw = await kv.get(KEY_CACHE)
    if (cachedRaw) {
      try {
        const cached = instagramCacheSchema.safeParse(JSON.parse(cachedRaw) as unknown)
        if (cached.success && Date.now() - cached.data.fetchedAt < CACHE_TTL_MS) return cached.data.post
        if (!cached.success) logCode('warn', LogCode.INSTAGRAM_CACHE_INVALID)
      } catch {
        logCode('warn', LogCode.INSTAGRAM_CACHE_INVALID)
      }
    }
  }

  let token = await getToken(kv)
  if (!token) return null
  if (kv) token = await maybeRefreshToken(kv, token)

  let post: InstagramPost | null = null
  try {
    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp'
    const url = `${GRAPH}/me/media?fields=${fields}&limit=1&access_token=${encodeURIComponent(token)}`
    const res = await fetch(url)
    if (!res.ok) {
      logCode('warn', LogCode.INSTAGRAM_MEDIA_FAILED, { status: res.status })
    } else {
      const json = instagramMediaSchema.safeParse((await res.json()) as unknown)
      const node = json.success ? json.data.data?.[0] : undefined
      const mapped = node ? mediaNodeToPost(node) : null
      if (!json.success || (node && !mapped)) logCode('warn', LogCode.INSTAGRAM_MEDIA_INVALID)
      post = mapped
    }
  } catch {
    // Network failures include the request URL, which carries the access token.
    logCode('warn', LogCode.INSTAGRAM_MEDIA_FAILED)
    post = null
  }

  // Cache successful lookups (including a legitimate "no posts" -> null result)
  // so a transient failure doesn't blank the section for everyone for 30 min.
  if (kv && post) {
    await kv.put(KEY_CACHE, JSON.stringify({ fetchedAt: Date.now(), post }))
  }
  return post
}
