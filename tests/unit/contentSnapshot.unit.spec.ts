// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { readSnapshot } from '@/lib/contentSnapshot'

let dir: string | null = null

afterEach(() => {
  vi.unstubAllEnvs()
  if (dir) {
    rmSync(dir, { recursive: true, force: true })
    dir = null
  }
})

function snapshotDir(files: Record<string, unknown>): string {
  dir = mkdtempSync(join(tmpdir(), 'snapshot-'))
  for (const [name, value] of Object.entries(files)) {
    writeFileSync(join(dir, `${name}.json`), JSON.stringify(value), 'utf8')
  }
  return dir
}

describe('readSnapshot', () => {
  it('returns null when CONTENT_SNAPSHOT is not set (Workers runtime)', async () => {
    vi.stubEnv('CONTENT_SNAPSHOT', '')
    expect(await readSnapshot('footer')).toBeNull()
  })

  it('reads and parses a snapshot file by name', async () => {
    vi.stubEnv('CONTENT_SNAPSHOT', snapshotDir({ footer: { email: 'info@burojazz.nl' } }))
    const footer = await readSnapshot<{ email: string }>('footer')
    expect(footer).toEqual({ email: 'info@burojazz.nl' })
  })

  it('preserves the parsed value shape (arrays, nested objects)', async () => {
    const pages = [{ slug: 'home', layout: [{ blockType: 'hero' }] }]
    vi.stubEnv('CONTENT_SNAPSHOT', snapshotDir({ pages }))
    expect(await readSnapshot('pages')).toEqual(pages)
  })

  it('returns null when the named file is missing from the dir', async () => {
    vi.stubEnv('CONTENT_SNAPSHOT', snapshotDir({ footer: {} }))
    expect(await readSnapshot('does-not-exist')).toBeNull()
  })

  it('returns null (never throws) on malformed JSON', async () => {
    dir = mkdtempSync(join(tmpdir(), 'snapshot-'))
    writeFileSync(join(dir, 'broken.json'), '{ not valid json', 'utf8')
    vi.stubEnv('CONTENT_SNAPSHOT', dir)
    expect(await readSnapshot('broken')).toBeNull()
  })

  it('returns null when the dir itself does not exist', async () => {
    vi.stubEnv('CONTENT_SNAPSHOT', join(tmpdir(), 'nonexistent-snapshot-dir-xyz'))
    expect(await readSnapshot('footer')).toBeNull()
  })
})
