// @vitest-environment node
/**
 * Migration replay test: applies every migration in order to a scratch local
 * D1 database (fresh miniflare state in a temp dir — never the real dev DB),
 * seeding representative rows BEFORE the migrations that transform data and
 * asserting the rows survive intact afterwards.
 *
 * Why not just run migrations on an empty database? The bug class this guards
 * against (drizzle-kit recreate-and-copy selecting columns that don't exist in
 * the old table) is *silent* on SQLite: an unknown double-quoted identifier
 * becomes a string literal, so on zero rows everything "succeeds". Only data
 * flowing through the copy exposes it.
 *
 * The static companion to this test is scripts/lint-migrations.mjs.
 */
import { createRequire } from 'module'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPlatformProxy } from 'wrangler'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { migrations } from '@/migrations'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsDir = path.resolve(dirname, '../../src/migrations')

// drizzle-orm is not a direct dependency; resolve it through the D1 adapter so
// the drizzle instance matches the `sql` tag the migration files import.
const adapterRequire = createRequire(require.resolve('@payloadcms/db-d1-sqlite'))
const { drizzle } = adapterRequire('drizzle-orm/d1') as {
  drizzle: (binding: unknown) => { run: (q: unknown) => Promise<unknown> }
}

let proxy: Awaited<ReturnType<typeof getPlatformProxy>>
let d1: {
  prepare: (query: string) => {
    bind: (...params: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> }
    run: () => Promise<unknown>
    all: () => Promise<{ results: Record<string, unknown>[] }>
  }
}
let scratchDir: string

const run = (query: string, ...params: unknown[]) =>
  params.length ? d1.prepare(query).bind(...params).run() : d1.prepare(query).run()
const all = async (query: string) => (await d1.prepare(query).all()).results

/**
 * Rows seeded immediately BEFORE the named migration runs, exercising the data
 * it transforms. Add an entry here whenever a new migration copies or rewrites
 * data.
 */
const seedBefore: Record<string, () => Promise<void>> = {
  '20260711_135639_header_nav_links': async () => {
    // Pre-migration state: header nav items were free-text (label, url) rows.
    await run(
      `INSERT INTO pages (id, title, slug, updated_at, created_at) VALUES (1, 'Home', 'home', '2026-01-01', '2026-01-01')`,
    )
    await run(
      `INSERT INTO header (id, cta_label, cta_url, updated_at, created_at) VALUES (1, 'Contact', '/contact', '2026-01-01', '2026-01-01')`,
    )
    await run(
      `INSERT INTO header_nav_items (_order, _parent_id, id, label, url) VALUES (1, 1, 'nav1', 'Home', '/'), (2, 1, 'nav2', 'Over ons', '/over-ons')`,
    )
  },
  '20260711_152316_trim_unrendered_block_fields': async () => {
    // A hero block with values in both kept and soon-dropped columns
    // (reuses the pages row with id 1 seeded before header_nav_links).
    await run(
      `INSERT INTO pages_blocks_hero (_order, _parent_id, _path, id, header_icon, header_eyebrow, header_title, header_subtitle, cert_link_variant, cert_link_label)
       VALUES (1, 1, 'layout', 'hero1', 'IconStar', 'Welkom', 'BURO J.A.Z.Z.', 'Jeugdhulp met Zorgzaamheid', 'secondary', 'Lees meer')`,
    )
  },
}

/** Assertions run immediately AFTER the named migration. */
const assertAfter: Record<string, () => Promise<void>> = {
  '20260711_135639_header_nav_links': async () => {
    const items = await all('SELECT * FROM header_nav_items ORDER BY _order')
    expect(items).toHaveLength(2)

    // Labels and URLs must survive the table recreation untouched.
    expect(items.map((i) => i.label)).toEqual(['Home', 'Over ons'])
    expect(items.map((i) => i.url)).toEqual(['/', '/over-ons'])

    // Pre-existing free-text rows become external links with no page ref.
    for (const item of items) {
      expect(item.type).toBe('external')
      expect(item.page_id).toBeNull()
      expect([0, null]).toContain(item.new_tab)
    }

    // The original generated migration filled these with the literal strings
    // 'type' / 'page_id' / 'new_tab' — the exact corruption this test pins.
    for (const item of items) {
      expect(item.type).not.toBe('type')
      expect(item.page_id).not.toBe('page_id')
      expect(item.new_tab).not.toBe('new_tab')
    }

    const [header] = await all('SELECT * FROM header')
    expect(header.cta_label).toBe('Contact')
    expect(header.cta_type).toBe('external')
    expect(header.cta_page_id).toBeNull()
  },
  '20260711_152316_trim_unrendered_block_fields': async () => {
    const [hero] = await all('SELECT * FROM pages_blocks_hero')

    // Values in kept columns survive the column drops untouched.
    expect(hero.header_title).toBe('BURO J.A.Z.Z.')
    expect(hero.header_subtitle).toBe('Jeugdhulp met Zorgzaamheid')
    expect(hero.cert_link_label).toBe('Lees meer')

    // The unrendered columns are actually gone.
    expect(hero).not.toHaveProperty('header_icon')
    expect(hero).not.toHaveProperty('header_eyebrow')
    expect(hero).not.toHaveProperty('cert_link_variant')
  },
  '20260711_181919_remove_hero_cert': async () => {
    // The hero table is recreated to drop the cert_* columns. The kept columns
    // (title/subtitle from the seeded row) must survive the copy untouched...
    const [hero] = await all('SELECT * FROM pages_blocks_hero')
    expect(hero.header_title).toBe('BURO J.A.Z.Z.')
    expect(hero.header_subtitle).toBe('Jeugdhulp met Zorgzaamheid')

    // ...and every cert_* column must be gone (not silently string-filled).
    expect(hero).not.toHaveProperty('cert_title')
    expect(hero).not.toHaveProperty('cert_text')
    expect(hero).not.toHaveProperty('cert_link_label')
    expect(hero).not.toHaveProperty('cert_link_type')
  },
}

describe('migration replay on a scratch D1', () => {
  beforeAll(async () => {
    scratchDir = fs.mkdtempSync(path.join(os.tmpdir(), 'burojazz-migration-replay-'))
    // remoteBindings: false forces the local miniflare simulator even though
    // wrangler.jsonc marks the dev D1 binding as remote (same approach as
    // payload.config.ts in non-production).
    proxy = await getPlatformProxy({ persist: { path: scratchDir }, remoteBindings: false })
    d1 = (proxy.env as Record<string, unknown>).D1 as typeof d1
  }, 60_000)

  afterAll(async () => {
    await proxy?.dispose()
    if (scratchDir) fs.rmSync(scratchDir, { recursive: true, force: true })
  })

  it(
    'applies every migration in order with data flowing through the copies',
    async () => {
      expect(migrations.length).toBeGreaterThan(0)
      const db = drizzle(d1)

      for (const migration of migrations) {
        await seedBefore[migration.name]?.()
        // Generated migrations only use db.run(sql`...`); payload/req unused.
        await migration.up({ db, payload: { logger: console }, req: {} } as never)
        await assertAfter[migration.name]?.()
      }
    },
    120_000,
  )

  it('leaves no column containing its own name as a literal value', async () => {
    // Sweep every text column of the final schema (from the last drizzle
    // snapshot) for cells equal to their column name — the fingerprint of
    // SQLite's double-quoted-string misfeature turning identifiers into
    // literals. Cheap here because the scratch DB only holds seeded rows.
    const lastSnapshotFile = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .at(-1)!
    const snapshot = JSON.parse(fs.readFileSync(path.join(migrationsDir, lastSnapshotFile), 'utf8'))

    const offenders: string[] = []
    for (const table of Object.values(snapshot.tables) as {
      name: string
      columns: Record<string, { name: string; type: string }>
    }[]) {
      for (const column of Object.values(table.columns)) {
        if (column.type !== 'text') continue
        const rows = await all(
          `SELECT COUNT(*) AS n FROM \`${table.name}\` WHERE \`${column.name}\` = '${column.name}'`,
        )
        if ((rows[0].n as number) > 0) offenders.push(`${table.name}.${column.name}`)
      }
    }
    expect(offenders).toEqual([])
  }, 60_000)

  it('leaves no dangling foreign key references', async () => {
    // D1 rejects PRAGMA foreign_key_check (SQLITE_AUTH), so validate every
    // foreign key declared in the final snapshot with a plain anti-join:
    // child rows whose non-null FK has no parent row.
    const lastSnapshotFile = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .at(-1)!
    const snapshot = JSON.parse(fs.readFileSync(path.join(migrationsDir, lastSnapshotFile), 'utf8'))

    const dangling: string[] = []
    for (const table of Object.values(snapshot.tables) as {
      name: string
      foreignKeys: Record<
        string,
        { tableFrom: string; tableTo: string; columnsFrom: string[]; columnsTo: string[] }
      >
    }[]) {
      for (const fk of Object.values(table.foreignKeys)) {
        const on = fk.columnsFrom
          .map((from, i) => `child.\`${from}\` = parent.\`${fk.columnsTo[i]}\``)
          .join(' AND ')
        const notNull = fk.columnsFrom.map((from) => `child.\`${from}\` IS NOT NULL`).join(' AND ')
        const rows = await all(
          `SELECT COUNT(*) AS n FROM \`${fk.tableFrom}\` child ` +
            `LEFT JOIN \`${fk.tableTo}\` parent ON ${on} ` +
            `WHERE ${notNull} AND parent.\`${fk.columnsTo[0]}\` IS NULL`,
        )
        if ((rows[0].n as number) > 0) {
          dangling.push(`${fk.tableFrom}(${fk.columnsFrom.join(',')}) → ${fk.tableTo}`)
        }
      }
    }
    expect(dangling).toEqual([])
  }, 60_000)
})
