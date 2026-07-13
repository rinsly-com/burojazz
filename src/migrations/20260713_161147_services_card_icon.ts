import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_services_tabs_cards\` ADD \`icon\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_services_tabs_cards\` ADD \`icon\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_services_tabs_cards\` DROP COLUMN \`icon\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_services_tabs_cards\` DROP COLUMN \`icon\`;`)
}
