import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_social\` ADD \`instagram_live\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_social\` ADD \`instagram_live\` integer DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_social\` DROP COLUMN \`instagram_live\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_social\` DROP COLUMN \`instagram_live\`;`)
}
