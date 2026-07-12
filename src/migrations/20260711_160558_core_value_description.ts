import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_core_values_values\` ADD \`description\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_core_values_values\` ADD \`description\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_core_values_values\` DROP COLUMN \`description\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_core_values_values\` DROP COLUMN \`description\`;`)
}
