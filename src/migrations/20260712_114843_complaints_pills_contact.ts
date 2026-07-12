import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_complaints_steps_info_pills\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`tone\` text DEFAULT 'brand',
  	\`text\` text,
  	\`note\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_complaints_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_complaints_steps_info_pills_order_idx\` ON \`pages_blocks_complaints_steps_info_pills\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_complaints_steps_info_pills_parent_id_idx\` ON \`pages_blocks_complaints_steps_info_pills\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_complaints_steps_info_pills\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`icon\` text,
  	\`tone\` text DEFAULT 'brand',
  	\`text\` text,
  	\`note\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_complaints_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_complaints_steps_info_pills_order_idx\` ON \`_pages_v_blocks_complaints_steps_info_pills\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_complaints_steps_info_pills_parent_id_idx\` ON \`_pages_v_blocks_complaints_steps_info_pills\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_complaints\` ADD \`contact_title\` text;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_complaints\` ADD \`contact_subtitle\` text;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_complaints\` ADD \`contact_photo_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_complaints\` ADD \`contact_phone\` text;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_complaints\` ADD \`contact_email\` text;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_complaints_contact_contact_photo_idx\` ON \`pages_blocks_complaints\` (\`contact_photo_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_complaints\` ADD \`contact_title\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_complaints\` ADD \`contact_subtitle\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_complaints\` ADD \`contact_photo_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_complaints\` ADD \`contact_phone\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_complaints\` ADD \`contact_email\` text;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_complaints_contact_contact_photo_idx\` ON \`_pages_v_blocks_complaints\` (\`contact_photo_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_complaints_steps_info_pills\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_complaints_steps_info_pills\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pages_blocks_complaints\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`header_icon\` text,
  	\`header_eyebrow\` text,
  	\`header_title\` text,
  	\`header_intro\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages_blocks_complaints\`("_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "header_intro", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "header_intro", "block_name" FROM \`pages_blocks_complaints\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_complaints\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_blocks_complaints\` RENAME TO \`pages_blocks_complaints\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_complaints_order_idx\` ON \`pages_blocks_complaints\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_complaints_parent_id_idx\` ON \`pages_blocks_complaints\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_complaints_path_idx\` ON \`pages_blocks_complaints\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v_blocks_complaints\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`header_icon\` text,
  	\`header_eyebrow\` text,
  	\`header_title\` text,
  	\`header_intro\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v_blocks_complaints\`("_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "header_intro", "_uuid", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "header_intro", "_uuid", "block_name" FROM \`_pages_v_blocks_complaints\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_complaints\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v_blocks_complaints\` RENAME TO \`_pages_v_blocks_complaints\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_complaints_order_idx\` ON \`_pages_v_blocks_complaints\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_complaints_parent_id_idx\` ON \`_pages_v_blocks_complaints\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_complaints_path_idx\` ON \`_pages_v_blocks_complaints\` (\`_path\`);`)
}
