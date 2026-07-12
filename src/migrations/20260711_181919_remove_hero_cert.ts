import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pages_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`header_title\` text,
  	\`header_subtitle\` text,
  	\`header_intro\` text,
  	\`image_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages_blocks_hero\`("_order", "_parent_id", "_path", "id", "header_title", "header_subtitle", "header_intro", "image_id", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_title", "header_subtitle", "header_intro", "image_id", "block_name" FROM \`pages_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_hero\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_blocks_hero\` RENAME TO \`pages_blocks_hero\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_order_idx\` ON \`pages_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_parent_id_idx\` ON \`pages_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_path_idx\` ON \`pages_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_image_idx\` ON \`pages_blocks_hero\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`header_title\` text,
  	\`header_subtitle\` text,
  	\`header_intro\` text,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v_blocks_hero\`("_order", "_parent_id", "_path", "id", "header_title", "header_subtitle", "header_intro", "image_id", "_uuid", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_title", "header_subtitle", "header_intro", "image_id", "_uuid", "block_name" FROM \`_pages_v_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_hero\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v_blocks_hero\` RENAME TO \`_pages_v_blocks_hero\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_order_idx\` ON \`_pages_v_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_parent_id_idx\` ON \`_pages_v_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_path_idx\` ON \`_pages_v_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_image_idx\` ON \`_pages_v_blocks_hero\` (\`image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_hero\` ADD \`cert_title\` text;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_hero\` ADD \`cert_text\` text;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_hero\` ADD \`cert_link_label\` text;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_hero\` ADD \`cert_link_type\` text DEFAULT 'internal';`)
  await db.run(sql`ALTER TABLE \`pages_blocks_hero\` ADD \`cert_link_page_id\` integer REFERENCES pages(id);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_hero\` ADD \`cert_link_url\` text;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_hero\` ADD \`cert_link_new_tab\` integer DEFAULT false;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_cert_link_cert_link_page_idx\` ON \`pages_blocks_hero\` (\`cert_link_page_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_hero\` ADD \`cert_title\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_hero\` ADD \`cert_text\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_hero\` ADD \`cert_link_label\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_hero\` ADD \`cert_link_type\` text DEFAULT 'internal';`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_hero\` ADD \`cert_link_page_id\` integer REFERENCES pages(id);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_hero\` ADD \`cert_link_url\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_hero\` ADD \`cert_link_new_tab\` integer DEFAULT false;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_cert_link_cert_link_page_idx\` ON \`_pages_v_blocks_hero\` (\`cert_link_page_id\`);`)
}
