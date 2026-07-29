import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_vacancies_cards\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_vacancies_cards_image_idx\` ON \`pages_blocks_vacancies_cards\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_vacancies_cards\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_vacancies_cards_image_idx\` ON \`_pages_v_blocks_vacancies_cards\` (\`image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pages_blocks_vacancies_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`location\` text,
  	\`hours\` text,
  	\`text\` text,
  	\`link_label\` text,
  	\`link_type\` text DEFAULT 'internal',
  	\`link_page_id\` integer,
  	\`link_url\` text,
  	\`link_anchor\` text,
  	\`link_new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_vacancies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages_blocks_vacancies_cards\`("_order", "_parent_id", "id", "title", "location", "hours", "text", "link_label", "link_type", "link_page_id", "link_url", "link_anchor", "link_new_tab") SELECT "_order", "_parent_id", "id", "title", "location", "hours", "text", "link_label", "link_type", "link_page_id", "link_url", "link_anchor", "link_new_tab" FROM \`pages_blocks_vacancies_cards\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_vacancies_cards\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_blocks_vacancies_cards\` RENAME TO \`pages_blocks_vacancies_cards\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_vacancies_cards_order_idx\` ON \`pages_blocks_vacancies_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_vacancies_cards_parent_id_idx\` ON \`pages_blocks_vacancies_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_vacancies_cards_link_link_page_idx\` ON \`pages_blocks_vacancies_cards\` (\`link_page_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v_blocks_vacancies_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`location\` text,
  	\`hours\` text,
  	\`text\` text,
  	\`link_label\` text,
  	\`link_type\` text DEFAULT 'internal',
  	\`link_page_id\` integer,
  	\`link_url\` text,
  	\`link_anchor\` text,
  	\`link_new_tab\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_vacancies\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v_blocks_vacancies_cards\`("_order", "_parent_id", "id", "title", "location", "hours", "text", "link_label", "link_type", "link_page_id", "link_url", "link_anchor", "link_new_tab", "_uuid") SELECT "_order", "_parent_id", "id", "title", "location", "hours", "text", "link_label", "link_type", "link_page_id", "link_url", "link_anchor", "link_new_tab", "_uuid" FROM \`_pages_v_blocks_vacancies_cards\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_vacancies_cards\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v_blocks_vacancies_cards\` RENAME TO \`_pages_v_blocks_vacancies_cards\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_vacancies_cards_order_idx\` ON \`_pages_v_blocks_vacancies_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_vacancies_cards_parent_id_idx\` ON \`_pages_v_blocks_vacancies_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_vacancies_cards_link_link_page_idx\` ON \`_pages_v_blocks_vacancies_cards\` (\`link_page_id\`);`)
}
