import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_core_values_values\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_core_values_values_image_idx\` ON \`pages_blocks_core_values_values\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_core_values_values\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_core_values_values_image_idx\` ON \`_pages_v_blocks_core_values_values\` (\`image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pages_blocks_core_values_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_core_values\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages_blocks_core_values_values\`("_order", "_parent_id", "id", "label") SELECT "_order", "_parent_id", "id", "label" FROM \`pages_blocks_core_values_values\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_core_values_values\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_blocks_core_values_values\` RENAME TO \`pages_blocks_core_values_values\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_core_values_values_order_idx\` ON \`pages_blocks_core_values_values\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_core_values_values_parent_id_idx\` ON \`pages_blocks_core_values_values\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v_blocks_core_values_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_core_values\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v_blocks_core_values_values\`("_order", "_parent_id", "id", "label", "_uuid") SELECT "_order", "_parent_id", "id", "label", "_uuid" FROM \`_pages_v_blocks_core_values_values\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_core_values_values\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v_blocks_core_values_values\` RENAME TO \`_pages_v_blocks_core_values_values\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_core_values_values_order_idx\` ON \`_pages_v_blocks_core_values_values\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_core_values_values_parent_id_idx\` ON \`_pages_v_blocks_core_values_values\` (\`_parent_id\`);`)
}
