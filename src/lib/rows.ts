import { z } from 'zod'

import type { Footer, Header, Page } from '@/payload-types'

import { LogCode, logCode } from './logCode'

const pageCore = z.looseObject({
  id: z.number(),
  slug: z.string().min(1),
})

const blockRow = z.looseObject({
  blockType: z.string().min(1),
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Keep object rows. A null (or other non-object) entry used to throw while
 * mapping the list and take the whole page down with it.
 */
export function keepObjectRows(value: unknown, collection: string): unknown {
  if (value == null) return value
  if (!Array.isArray(value)) {
    logCode('warn', LogCode.DB_LIST_INVALID, { collection })
    return []
  }
  const kept: unknown[] = []
  value.forEach((row, index) => {
    if (!isRecord(row)) {
      logCode('warn', LogCode.DB_ROW_SKIPPED, { collection, index })
      return
    }
    kept.push(row)
  })
  return kept
}

function blocksOf(layout: unknown[]): Page['layout'] {
  const blocks: unknown[] = []
  layout.forEach((block, blockIndex) => {
    const parsed = blockRow.safeParse(block)
    if (!parsed.success) {
      logCode('warn', LogCode.DB_ROW_SKIPPED, { collection: 'page-blocks', index: blockIndex })
      return
    }
    blocks.push(parsed.data)
  })
  return blocks as Page['layout']
}

/** One page document. Null means the row cannot be rendered and must be skipped. */
export function parsePageRow(row: unknown, index = 0): Page | null {
  const parsed = pageCore.safeParse(row)
  if (!parsed.success) {
    logCode('warn', LogCode.DB_ROW_SKIPPED, { collection: 'pages', index })
    return null
  }
  const page = parsed.data as unknown as Page
  if (!isRecord(row) || !('layout' in row)) return page
  const layout = row.layout
  if (layout == null) {
    page.layout = layout
    return page
  }
  if (!Array.isArray(layout)) {
    logCode('warn', LogCode.DB_ROW_SKIPPED, { collection: 'pages', index })
    return null
  }
  page.layout = blocksOf(layout)
  return page
}

function asUnknownList(value: unknown): unknown[] {
  if (!Array.isArray(value)) return []
  const out: unknown[] = []
  for (const item of value) out.push(item as unknown)
  return out
}

function docsOf(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) return asUnknownList(payload)
  if (isRecord(payload) && 'docs' in payload) {
    const docs = payload.docs
    if (docs == null) return []
    if (!Array.isArray(docs)) return null
    return asUnknownList(docs)
  }
  return null
}

/**
 * A pages list (API `{ docs }` or a snapshot array). A bad row is skipped and
 * logged; the rest of the list is returned. An unreadable payload is an empty
 * list, not a throw.
 */
export function parsePageList(payload: unknown): Page[] {
  const docs = docsOf(payload)
  if (docs === null) {
    logCode('warn', LogCode.DB_LIST_INVALID, { collection: 'pages' })
    return []
  }
  const pages: Page[] = []
  docs.forEach((row, index) => {
    const page = parsePageRow(row, index)
    if (page) pages.push(page)
  })
  return pages
}

const commentCore = z.looseObject({
  id: z.union([z.number(), z.string().min(1)]),
  body: z.string(),
  createdAt: z.string(),
})

export type CommentRow = z.infer<typeof commentCore>

/** Admin comment list. A bad row is skipped so one document cannot blank the panel. */
export function parseCommentList(payload: unknown): CommentRow[] {
  const docs = docsOf(payload)
  if (docs === null) {
    logCode('warn', LogCode.DB_LIST_INVALID, { collection: 'comments' })
    return []
  }
  const comments: CommentRow[] = []
  docs.forEach((row, index) => {
    const parsed = commentCore.safeParse(row)
    if (!parsed.success) {
      logCode('warn', LogCode.COMMENT_ROW_SKIPPED, { collection: 'comments', index })
      return
    }
    comments.push(parsed.data)
  })
  return comments
}

function parseGlobal(value: unknown, slug: string, listKeys: readonly string[]): Record<string, unknown> | null {
  if (!isRecord(value)) {
    logCode('warn', LogCode.DB_ROW_SKIPPED, { collection: slug })
    return null
  }
  const copy: Record<string, unknown> = { ...value }
  for (const key of listKeys) {
    if (!(key in copy)) continue
    copy[key] = keepObjectRows(copy[key], `${slug}.${key}`)
  }
  return copy
}

export function parseHeader(value: unknown): Header | null {
  return parseGlobal(value, 'header', ['navItems']) as Header | null
}

export function parseFooter(value: unknown): Footer | null {
  return parseGlobal(value, 'footer', [
    'menuItems',
    'infoLinks',
    'socials',
    'certificates',
  ]) as Footer | null
}
