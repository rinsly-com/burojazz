import { z } from 'zod'

import { LogCode, logCode } from './logCode'

/**
 * Read process.env through a record so this stays valid when wrangler types
 * the env as a closed interface (no string index signature). Values are
 * returned unchanged when they match the schema; a bad value falls back and
 * is logged by name only.
 */
const envRecord = process.env as unknown as Record<string, string | undefined>

function readRaw(name: string): string | undefined {
  const value = envRecord[name]
  return typeof value === 'string' ? value : undefined
}

export function envUrl(name: string, fallback: string): string {
  const value = readRaw(name)
  if (value == null || value === '') return fallback
  const parsed = z.url().safeParse(value)
  if (!parsed.success) {
    logCode('warn', LogCode.ENV_INVALID, { name })
    return fallback
  }
  return parsed.data
}

/**
 * Validate a URL that was read with a direct `process.env.NEXT_PUBLIC_*` access.
 * Next only inlines those member expressions; do not pass a dynamically read value
 * from client code. Unset stays '' (same-origin). A value that is not a URL
 * becomes '' and is logged by name.
 */
export function validatePublicUrl(name: string, value: string | undefined): string {
  if (value == null || value === '') return ''
  const parsed = z.url().safeParse(value)
  if (!parsed.success) {
    logCode('warn', LogCode.ENV_INVALID, { name })
    return ''
  }
  return parsed.data
}

export function envOptionalUrl(name: string): string | undefined {
  const value = readRaw(name)
  if (value == null || value === '') return undefined
  const parsed = z.url().safeParse(value)
  if (!parsed.success) {
    logCode('warn', LogCode.ENV_INVALID, { name })
    return undefined
  }
  return parsed.data
}

/** Short non-address config string (display name, etc.). */
export function envText(name: string, fallback: string): string {
  const value = readRaw(name)
  if (value == null || value === '') return fallback
  const parsed = z.string().min(1).max(200).safeParse(value)
  if (!parsed.success) {
    logCode('warn', LogCode.ENV_INVALID, { name })
    return fallback
  }
  return parsed.data
}

export function envEmail(name: string, fallback: string): string {
  const value = readRaw(name)
  if (value == null || value === '') return fallback
  const parsed = z.email().safeParse(value)
  if (!parsed.success) {
    logCode('warn', LogCode.ENV_INVALID, { name })
    return fallback
  }
  return parsed.data
}

/** Opaque secret. The value is never logged. Empty counts as unset. */
export function envOptionalSecret(name: string): string | undefined {
  const value = readRaw(name)
  if (value == null || value === '') return undefined
  const parsed = z.string().min(1).max(4096).safeParse(value)
  if (!parsed.success) {
    logCode('warn', LogCode.ENV_INVALID, { name })
    return undefined
  }
  return parsed.data
}

/** GitHub event_type and similar tokens. Invalid values use the fallback. */
export function envEventName(name: string, fallback: string): string {
  const value = readRaw(name)
  if (value == null || value === '') return fallback
  const parsed = z
    .string()
    .regex(/^[A-Za-z0-9._-]{1,80}$/)
    .safeParse(value)
  if (!parsed.success) {
    logCode('warn', LogCode.ENV_INVALID, { name })
    return fallback
  }
  return parsed.data
}

/** Directory path used at build time. Rejects newlines so it cannot smuggle a second argument. */
export function envOptionalPath(name: string): string | undefined {
  const value = readRaw(name)
  if (value == null || value === '') return undefined
  const parsed = z
    .string()
    .min(1)
    .max(4096)
    .regex(/^[^\u0000\r\n]+$/)
    .safeParse(value)
  if (!parsed.success) {
    logCode('warn', LogCode.ENV_INVALID, { name })
    return undefined
  }
  return parsed.data
}
