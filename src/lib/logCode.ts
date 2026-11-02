/**
 * Boundary logs. The code is a fixed identifier; context is an allow-listed
 * set of short scalars. Raw error messages, request bodies, URLs, tokens and
 * addresses are dropped so a catch cannot leak them.
 */

export const LogCode = {
  AANMELDING_BODY_INVALID: 'AANMELDING_BODY_INVALID',
  AANMELDING_CONFIRM_FAILED: 'AANMELDING_CONFIRM_FAILED',
  AANMELDING_NOTIFY_FAILED: 'AANMELDING_NOTIFY_FAILED',
  AANMELDING_SUBMIT_REJECTED: 'AANMELDING_SUBMIT_REJECTED',
  BUILD_SNAPSHOT_FAILED: 'BUILD_SNAPSHOT_FAILED',
  BUILD_SNAPSHOT_GLOBAL_FAILED: 'BUILD_SNAPSHOT_GLOBAL_FAILED',
  COMMENT_FETCH_FAILED: 'COMMENT_FETCH_FAILED',
  COMMENT_ROW_SKIPPED: 'COMMENT_ROW_SKIPPED',
  CONTENT_SNAPSHOT_READ_FAILED: 'CONTENT_SNAPSHOT_READ_FAILED',
  DB_LIST_INVALID: 'DB_LIST_INVALID',
  DB_ROW_SKIPPED: 'DB_ROW_SKIPPED',
  DEPLOY_DISPATCH_FAILED: 'DEPLOY_DISPATCH_FAILED',
  DEPLOY_DISPATCH_HTTP: 'DEPLOY_DISPATCH_HTTP',
  DEPLOY_PANEL_FAILED: 'DEPLOY_PANEL_FAILED',
  EMAIL_BINDING_UNAVAILABLE: 'EMAIL_BINDING_UNAVAILABLE',
  EMAIL_SETTINGS_READ_FAILED: 'EMAIL_SETTINGS_READ_FAILED',
  ENV_INVALID: 'ENV_INVALID',
  GLOBAL_FETCH_FAILED: 'GLOBAL_FETCH_FAILED',
  INSTAGRAM_CACHE_INVALID: 'INSTAGRAM_CACHE_INVALID',
  INSTAGRAM_CLIENT_FETCH_FAILED: 'INSTAGRAM_CLIENT_FETCH_FAILED',
  INSTAGRAM_CLIENT_PAYLOAD_INVALID: 'INSTAGRAM_CLIENT_PAYLOAD_INVALID',
  INSTAGRAM_KV_UNAVAILABLE: 'INSTAGRAM_KV_UNAVAILABLE',
  INSTAGRAM_MEDIA_FAILED: 'INSTAGRAM_MEDIA_FAILED',
  INSTAGRAM_MEDIA_INVALID: 'INSTAGRAM_MEDIA_INVALID',
  INSTAGRAM_TOKEN_REFRESH_FAILED: 'INSTAGRAM_TOKEN_REFRESH_FAILED',
  PAGES_FETCH_FAILED: 'PAGES_FETCH_FAILED',
  SECTION_SELECT_LOAD_FAILED: 'SECTION_SELECT_LOAD_FAILED',
  SEED_FAILED: 'SEED_FAILED',
  SEED_PUBLISH_FAILED: 'SEED_PUBLISH_FAILED',
  SEED_VERSION_REPAIR_FAILED: 'SEED_VERSION_REPAIR_FAILED',
  TEST_CLEANUP_FAILED: 'TEST_CLEANUP_FAILED',
} as const

export type LogCodeName = (typeof LogCode)[keyof typeof LogCode]

const CONTEXT_KEYS = new Set(['binding', 'collection', 'index', 'name', 'slug', 'status'])

export type LogContext = Partial<
  Record<'binding' | 'collection' | 'index' | 'name' | 'slug' | 'status', string | number | boolean | null>
>

type LogFn = (entry: { code: LogCodeName } & Record<string, string | number | boolean | null>) => void

export type CodeLogger = {
  info?: LogFn
  warn?: LogFn
  error?: LogFn
}

const UNSAFE_TEXT = /[@:\/\\]|bearer|token|secret|password|key=/i

function safeContext(
  context: LogContext | undefined,
): Record<string, string | number | boolean | null> {
  const safe: Record<string, string | number | boolean | null> = {}
  if (!context) return safe
  for (const [key, value] of Object.entries(context)) {
    if (!CONTEXT_KEYS.has(key) || value == null) continue
    if (typeof value === 'number') {
      if (Number.isFinite(value)) safe[key] = value
      continue
    }
    if (typeof value === 'boolean') {
      safe[key] = value
      continue
    }
    if (typeof value !== 'string') continue
    if (value.length === 0 || value.length > 64) continue
    if (UNSAFE_TEXT.test(value)) continue
    safe[key] = value
  }
  return safe
}

export function logCode(
  level: 'info' | 'warn' | 'error',
  code: LogCodeName,
  context?: LogContext,
  logger?: CodeLogger,
): void {
  const entry = { code, ...safeContext(context) }
  const sink = logger?.[level]
  if (sink) {
    sink(entry)
    return
  }
  if (level === 'info') console.info(entry)
  else if (level === 'warn') console.warn(entry)
  else console.error(entry)
}
