import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_footer_menu_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`type\` text DEFAULT 'internal',
  	\`page_id\` integer,
  	\`url\` text,
  	\`anchor\` text,
  	\`new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  // The old table only had (label, url) — carry existing rows over as external
  // links so the footer keeps working until editors switch them to internal
  // page references. Selecting the new columns here would silently store the
  // column *names* as strings (https://sqlite.org/quirks.html#dblquote).
  await db.run(sql`INSERT INTO \`__new_footer_menu_items\`("_order", "_parent_id", "id", "label", "type", "page_id", "url", "anchor", "new_tab") SELECT "_order", "_parent_id", "id", COALESCE("label", ''), 'external', NULL, "url", NULL, false FROM \`footer_menu_items\`;`)
  await db.run(sql`DROP TABLE \`footer_menu_items\`;`)
  await db.run(sql`ALTER TABLE \`__new_footer_menu_items\` RENAME TO \`footer_menu_items\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`footer_menu_items_order_idx\` ON \`footer_menu_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_menu_items_parent_id_idx\` ON \`footer_menu_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`footer_menu_items_page_idx\` ON \`footer_menu_items\` (\`page_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_footer_info_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`type\` text DEFAULT 'internal',
  	\`page_id\` integer,
  	\`url\` text,
  	\`anchor\` text,
  	\`new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  // Same as the menu items above: old rows only had (label, url). Info entries
  // with an empty URL stay label-only and render as plain text.
  await db.run(sql`INSERT INTO \`__new_footer_info_links\`("_order", "_parent_id", "id", "label", "type", "page_id", "url", "anchor", "new_tab") SELECT "_order", "_parent_id", "id", COALESCE("label", ''), 'external', NULL, "url", NULL, false FROM \`footer_info_links\`;`)
  await db.run(sql`DROP TABLE \`footer_info_links\`;`)
  await db.run(sql`ALTER TABLE \`__new_footer_info_links\` RENAME TO \`footer_info_links\`;`)
  await db.run(sql`CREATE INDEX \`footer_info_links_order_idx\` ON \`footer_info_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_info_links_parent_id_idx\` ON \`footer_info_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`footer_info_links_page_idx\` ON \`footer_info_links\` (\`page_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_footer_menu_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_footer_menu_items\`("_order", "_parent_id", "id", "label", "url") SELECT "_order", "_parent_id", "id", "label", "url" FROM \`footer_menu_items\`;`)
  await db.run(sql`DROP TABLE \`footer_menu_items\`;`)
  await db.run(sql`ALTER TABLE \`__new_footer_menu_items\` RENAME TO \`footer_menu_items\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`footer_menu_items_order_idx\` ON \`footer_menu_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_menu_items_parent_id_idx\` ON \`footer_menu_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_footer_info_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_footer_info_links\`("_order", "_parent_id", "id", "label", "url") SELECT "_order", "_parent_id", "id", "label", "url" FROM \`footer_info_links\`;`)
  await db.run(sql`DROP TABLE \`footer_info_links\`;`)
  await db.run(sql`ALTER TABLE \`__new_footer_info_links\` RENAME TO \`footer_info_links\`;`)
  await db.run(sql`CREATE INDEX \`footer_info_links_order_idx\` ON \`footer_info_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_info_links_parent_id_idx\` ON \`footer_info_links\` (\`_parent_id\`);`)
}
