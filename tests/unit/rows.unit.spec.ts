/**
 * DB row parsers. A list used to be cast through and rendered as-is, so one
 * null block or a row without a slug threw while mapping and failed the whole
 * page list (500) instead of skipping the bad row.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { parseFooter, parsePageList, parsePageRow } from '@/lib/rows'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('parsePageList', () => {
  it('keeps valid pages and skips a bad row instead of throwing', () => {
    // REGRESSION: one malformed document in /api/pages took the whole list
    // down while the index was rendering.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const pages = parsePageList({
      docs: [
        { id: 1, slug: 'home', title: 'Home', layout: [{ blockType: 'hero', heading: 'Hi' }] },
        null,
        { id: 2, title: 'No slug' },
        { id: 3, slug: 'contact', title: 'Contact', layout: [{ blockType: 'richText' }, null] },
        { id: 4, slug: 'broken', title: 'Broken', layout: 'nope' },
      ],
    })

    expect(pages.map((page) => page.slug)).toEqual(['home', 'contact'])
    expect(pages[1]?.layout).toEqual([{ blockType: 'richText' }])
    expect(warn.mock.calls.map((call) => (call[0] as { code?: string }).code)).toEqual([
      'DB_ROW_SKIPPED',
      'DB_ROW_SKIPPED',
      'DB_ROW_SKIPPED',
      'DB_ROW_SKIPPED',
    ])
    const logged = JSON.stringify(warn.mock.calls)
    expect(logged).not.toContain('No slug')
    expect(logged).not.toContain('Broken')
  })

  it('returns an empty list when the payload is not a document list', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(parsePageList({ unexpected: true })).toEqual([])
    expect(warn).toHaveBeenCalledWith(expect.objectContaining({ code: 'DB_LIST_INVALID' }))
  })
})

describe('parsePageRow', () => {
  it('preserves fields the schema does not mention', () => {
    const page = parsePageRow({ id: 7, slug: 'home', title: 'Home', workflowStatus: 'ready' })
    expect(page).toMatchObject({ id: 7, slug: 'home', title: 'Home', workflowStatus: 'ready' })
  })
})

describe('parseFooter', () => {
  it('drops a null menu item and keeps the rest of the footer', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const footer = parseFooter({
      id: 1,
      email: 'contact@burojazz.nl',
      menuItems: [{ label: 'Home', type: 'external', url: '/' }, null],
    })
    expect(footer?.email).toBe('contact@burojazz.nl')
    expect(footer?.menuItems).toEqual([{ label: 'Home', type: 'external', url: '/' }])
    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'DB_ROW_SKIPPED', collection: 'footer.menuItems' }),
    )
    expect(JSON.stringify(warn.mock.calls)).not.toContain('contact@burojazz.nl')
  })
})
