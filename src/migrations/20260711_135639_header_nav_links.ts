import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_header_nav_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`type\` text DEFAULT 'internal',
  	\`page_id\` integer,
  	\`url\` text,
  	\`new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  // The old table only had (label, url) — carry existing rows over as
  // external links so the nav keeps working until editors switch them to
  // internal page references.
  await db.run(sql`INSERT INTO \`__new_header_nav_items\`("_order", "_parent_id", "id", "label", "type", "page_id", "url", "new_tab") SELECT "_order", "_parent_id", "id", COALESCE("label", ''), 'external', NULL, "url", false FROM \`header_nav_items\`;`)
  await db.run(sql`DROP TABLE \`header_nav_items\`;`)
  await db.run(sql`ALTER TABLE \`__new_header_nav_items\` RENAME TO \`header_nav_items\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`header_nav_items_order_idx\` ON \`header_nav_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`header_nav_items_parent_id_idx\` ON \`header_nav_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`header_nav_items_page_idx\` ON \`header_nav_items\` (\`page_id\`);`)
  await db.run(sql`ALTER TABLE \`header\` ADD \`cta_type\` text DEFAULT 'internal';`)
  await db.run(sql`ALTER TABLE \`header\` ADD \`cta_page_id\` integer REFERENCES pages(id);`)
  await db.run(sql`ALTER TABLE \`header\` ADD \`cta_new_tab\` integer DEFAULT false;`)
  await db.run(sql`CREATE INDEX \`header_cta_cta_page_idx\` ON \`header\` (\`cta_page_id\`);`)
  // The pre-existing CTA was a free-text URL — mark it external.
  await db.run(sql`UPDATE \`header\` SET \`cta_type\` = 'external' WHERE \`cta_url\` IS NOT NULL AND \`cta_url\` <> '';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_header_nav_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_header_nav_items\`("_order", "_parent_id", "id", "label", "url") SELECT "_order", "_parent_id", "id", "label", "url" FROM \`header_nav_items\`;`)
  await db.run(sql`DROP TABLE \`header_nav_items\`;`)
  await db.run(sql`ALTER TABLE \`__new_header_nav_items\` RENAME TO \`header_nav_items\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`header_nav_items_order_idx\` ON \`header_nav_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`header_nav_items_parent_id_idx\` ON \`header_nav_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_header\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`cta_label\` text,
  	\`cta_url\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_header\`("id", "cta_label", "cta_url", "updated_at", "created_at") SELECT "id", "cta_label", "cta_url", "updated_at", "created_at" FROM \`header\`;`)
  await db.run(sql`DROP TABLE \`header\`;`)
  await db.run(sql`ALTER TABLE \`__new_header\` RENAME TO \`header\`;`)
}
