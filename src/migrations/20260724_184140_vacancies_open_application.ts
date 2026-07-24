import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_vacancies\` ADD \`open_application_text\` text;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_vacancies\` ADD \`open_application_label\` text;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_vacancies\` ADD \`open_application_type\` text DEFAULT 'internal';`)
  await db.run(sql`ALTER TABLE \`pages_blocks_vacancies\` ADD \`open_application_page_id\` integer REFERENCES pages(id);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_vacancies\` ADD \`open_application_url\` text;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_vacancies\` ADD \`open_application_anchor\` text;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_vacancies\` ADD \`open_application_new_tab\` integer DEFAULT false;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_vacancies_open_application_open_application_idx\` ON \`pages_blocks_vacancies\` (\`open_application_page_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_vacancies\` ADD \`open_application_text\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_vacancies\` ADD \`open_application_label\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_vacancies\` ADD \`open_application_type\` text DEFAULT 'internal';`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_vacancies\` ADD \`open_application_page_id\` integer REFERENCES pages(id);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_vacancies\` ADD \`open_application_url\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_vacancies\` ADD \`open_application_anchor\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_vacancies\` ADD \`open_application_new_tab\` integer DEFAULT false;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_vacancies_open_application_open_applicat_idx\` ON \`_pages_v_blocks_vacancies\` (\`open_application_page_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pages_blocks_vacancies\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`header_icon\` text,
  	\`header_eyebrow\` text,
  	\`header_title\` text,
  	\`header_intro\` text,
  	\`anchor\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages_blocks_vacancies\`("_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "header_intro", "anchor", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "header_intro", "anchor", "block_name" FROM \`pages_blocks_vacancies\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_vacancies\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_blocks_vacancies\` RENAME TO \`pages_blocks_vacancies\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_vacancies_order_idx\` ON \`pages_blocks_vacancies\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_vacancies_parent_id_idx\` ON \`pages_blocks_vacancies\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_vacancies_path_idx\` ON \`pages_blocks_vacancies\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v_blocks_vacancies\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`header_icon\` text,
  	\`header_eyebrow\` text,
  	\`header_title\` text,
  	\`header_intro\` text,
  	\`anchor\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v_blocks_vacancies\`("_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "header_intro", "anchor", "_uuid", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "header_intro", "anchor", "_uuid", "block_name" FROM \`_pages_v_blocks_vacancies\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_vacancies\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v_blocks_vacancies\` RENAME TO \`_pages_v_blocks_vacancies\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_vacancies_order_idx\` ON \`_pages_v_blocks_vacancies\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_vacancies_parent_id_idx\` ON \`_pages_v_blocks_vacancies\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_vacancies_path_idx\` ON \`_pages_v_blocks_vacancies\` (\`_path\`);`)
}
