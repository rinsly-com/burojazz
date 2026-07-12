import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_hero\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_image_idx\` ON \`pages_blocks_hero\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_contact_persons_people\` ADD \`photo_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_contact_persons_people\` ADD \`phone\` text;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_contact_persons_people\` ADD \`email\` text;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_persons_people_photo_idx\` ON \`pages_blocks_contact_persons_people\` (\`photo_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_hero\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_image_idx\` ON \`_pages_v_blocks_hero\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_contact_persons_people\` ADD \`photo_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_contact_persons_people\` ADD \`phone\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_contact_persons_people\` ADD \`email\` text;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_contact_persons_people_photo_idx\` ON \`_pages_v_blocks_contact_persons_people\` (\`photo_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pages_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`header_title\` text,
  	\`header_subtitle\` text,
  	\`header_intro\` text,
  	\`cert_title\` text,
  	\`cert_text\` text,
  	\`cert_link_label\` text,
  	\`cert_link_type\` text DEFAULT 'internal',
  	\`cert_link_page_id\` integer,
  	\`cert_link_url\` text,
  	\`cert_link_new_tab\` integer DEFAULT false,
  	\`block_name\` text,
  	FOREIGN KEY (\`cert_link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages_blocks_hero\`("_order", "_parent_id", "_path", "id", "header_title", "header_subtitle", "header_intro", "cert_title", "cert_text", "cert_link_label", "cert_link_type", "cert_link_page_id", "cert_link_url", "cert_link_new_tab", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_title", "header_subtitle", "header_intro", "cert_title", "cert_text", "cert_link_label", "cert_link_type", "cert_link_page_id", "cert_link_url", "cert_link_new_tab", "block_name" FROM \`pages_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_hero\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_blocks_hero\` RENAME TO \`pages_blocks_hero\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_order_idx\` ON \`pages_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_parent_id_idx\` ON \`pages_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_path_idx\` ON \`pages_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_cert_link_cert_link_page_idx\` ON \`pages_blocks_hero\` (\`cert_link_page_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_pages_blocks_contact_persons_people\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_contact_persons\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages_blocks_contact_persons_people\`("_order", "_parent_id", "id", "name", "role") SELECT "_order", "_parent_id", "id", "name", "role" FROM \`pages_blocks_contact_persons_people\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_contact_persons_people\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_blocks_contact_persons_people\` RENAME TO \`pages_blocks_contact_persons_people\`;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_persons_people_order_idx\` ON \`pages_blocks_contact_persons_people\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_contact_persons_people_parent_id_idx\` ON \`pages_blocks_contact_persons_people\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`header_title\` text,
  	\`header_subtitle\` text,
  	\`header_intro\` text,
  	\`cert_title\` text,
  	\`cert_text\` text,
  	\`cert_link_label\` text,
  	\`cert_link_type\` text DEFAULT 'internal',
  	\`cert_link_page_id\` integer,
  	\`cert_link_url\` text,
  	\`cert_link_new_tab\` integer DEFAULT false,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`cert_link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v_blocks_hero\`("_order", "_parent_id", "_path", "id", "header_title", "header_subtitle", "header_intro", "cert_title", "cert_text", "cert_link_label", "cert_link_type", "cert_link_page_id", "cert_link_url", "cert_link_new_tab", "_uuid", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_title", "header_subtitle", "header_intro", "cert_title", "cert_text", "cert_link_label", "cert_link_type", "cert_link_page_id", "cert_link_url", "cert_link_new_tab", "_uuid", "block_name" FROM \`_pages_v_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_hero\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v_blocks_hero\` RENAME TO \`_pages_v_blocks_hero\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_order_idx\` ON \`_pages_v_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_parent_id_idx\` ON \`_pages_v_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_path_idx\` ON \`_pages_v_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_cert_link_cert_link_page_idx\` ON \`_pages_v_blocks_hero\` (\`cert_link_page_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v_blocks_contact_persons_people\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_contact_persons\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v_blocks_contact_persons_people\`("_order", "_parent_id", "id", "name", "role", "_uuid") SELECT "_order", "_parent_id", "id", "name", "role", "_uuid" FROM \`_pages_v_blocks_contact_persons_people\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_contact_persons_people\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v_blocks_contact_persons_people\` RENAME TO \`_pages_v_blocks_contact_persons_people\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_contact_persons_people_order_idx\` ON \`_pages_v_blocks_contact_persons_people\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_contact_persons_people_parent_id_idx\` ON \`_pages_v_blocks_contact_persons_people\` (\`_parent_id\`);`)
}
