import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages\` ADD \`meta_noindex\` integer;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_meta_noindex\` integer;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages\` DROP COLUMN \`meta_noindex\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` DROP COLUMN \`version_meta_noindex\`;`)
}
