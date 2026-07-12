import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_about\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_image_idx\` ON \`pages_blocks_about\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_core_values\` ADD \`logo_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_core_values_logo_idx\` ON \`pages_blocks_core_values\` (\`logo_id\`);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_vision_mission\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_vision_mission_image_idx\` ON \`pages_blocks_vision_mission\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_social\` ADD \`photos_toys_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_social\` ADD \`photos_gym_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_social\` ADD \`photos_boxing_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_social\` ADD \`photos_figures_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_social\` ADD \`photos_phone_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_photos_photos_toys_idx\` ON \`pages_blocks_social\` (\`photos_toys_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_photos_photos_gym_idx\` ON \`pages_blocks_social\` (\`photos_gym_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_photos_photos_boxing_idx\` ON \`pages_blocks_social\` (\`photos_boxing_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_photos_photos_figures_idx\` ON \`pages_blocks_social\` (\`photos_figures_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_photos_photos_phone_idx\` ON \`pages_blocks_social\` (\`photos_phone_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_about\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_image_idx\` ON \`_pages_v_blocks_about\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_core_values\` ADD \`logo_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_core_values_logo_idx\` ON \`_pages_v_blocks_core_values\` (\`logo_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_vision_mission\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_vision_mission_image_idx\` ON \`_pages_v_blocks_vision_mission\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_social\` ADD \`photos_toys_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_social\` ADD \`photos_gym_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_social\` ADD \`photos_boxing_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_social\` ADD \`photos_figures_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_social\` ADD \`photos_phone_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_photos_photos_toys_idx\` ON \`_pages_v_blocks_social\` (\`photos_toys_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_photos_photos_gym_idx\` ON \`_pages_v_blocks_social\` (\`photos_gym_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_photos_photos_boxing_idx\` ON \`_pages_v_blocks_social\` (\`photos_boxing_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_photos_photos_figures_idx\` ON \`_pages_v_blocks_social\` (\`photos_figures_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_photos_photos_phone_idx\` ON \`_pages_v_blocks_social\` (\`photos_phone_id\`);`)
  await db.run(sql`ALTER TABLE \`header\` ADD \`logo_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`header_logo_idx\` ON \`header\` (\`logo_id\`);`)
  await db.run(sql`ALTER TABLE \`footer\` ADD \`logo_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`footer\` ADD \`cert_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`footer_logo_idx\` ON \`footer\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`footer_cert_image_idx\` ON \`footer\` (\`cert_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pages_blocks_about\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`header_icon\` text,
  	\`header_eyebrow\` text,
  	\`header_title\` text,
  	\`body\` text,
  	\`email\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages_blocks_about\`("_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "body", "email", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "body", "email", "block_name" FROM \`pages_blocks_about\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_about\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_blocks_about\` RENAME TO \`pages_blocks_about\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_order_idx\` ON \`pages_blocks_about\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_parent_id_idx\` ON \`pages_blocks_about\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_about_path_idx\` ON \`pages_blocks_about\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`__new_pages_blocks_core_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`header_icon\` text,
  	\`header_eyebrow\` text,
  	\`header_title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages_blocks_core_values\`("_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "block_name" FROM \`pages_blocks_core_values\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_core_values\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_blocks_core_values\` RENAME TO \`pages_blocks_core_values\`;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_core_values_order_idx\` ON \`pages_blocks_core_values\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_core_values_parent_id_idx\` ON \`pages_blocks_core_values\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_core_values_path_idx\` ON \`pages_blocks_core_values\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`__new_pages_blocks_vision_mission\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`header_icon\` text,
  	\`header_eyebrow\` text,
  	\`header_title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages_blocks_vision_mission\`("_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "block_name" FROM \`pages_blocks_vision_mission\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_vision_mission\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_blocks_vision_mission\` RENAME TO \`pages_blocks_vision_mission\`;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_vision_mission_order_idx\` ON \`pages_blocks_vision_mission\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_vision_mission_parent_id_idx\` ON \`pages_blocks_vision_mission\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_vision_mission_path_idx\` ON \`pages_blocks_vision_mission\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`__new_pages_blocks_social\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`header_icon\` text,
  	\`header_eyebrow\` text,
  	\`header_title\` text,
  	\`header_subtitle\` text,
  	\`handle\` text,
  	\`link_label\` text,
  	\`link_type\` text DEFAULT 'internal',
  	\`link_page_id\` integer,
  	\`link_url\` text,
  	\`link_new_tab\` integer DEFAULT false,
  	\`block_name\` text,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages_blocks_social\`("_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "header_subtitle", "handle", "link_label", "link_type", "link_page_id", "link_url", "link_new_tab", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "header_subtitle", "handle", "link_label", "link_type", "link_page_id", "link_url", "link_new_tab", "block_name" FROM \`pages_blocks_social\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_social\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_blocks_social\` RENAME TO \`pages_blocks_social\`;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_order_idx\` ON \`pages_blocks_social\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_parent_id_idx\` ON \`pages_blocks_social\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_path_idx\` ON \`pages_blocks_social\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_link_link_page_idx\` ON \`pages_blocks_social\` (\`link_page_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v_blocks_about\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`header_icon\` text,
  	\`header_eyebrow\` text,
  	\`header_title\` text,
  	\`body\` text,
  	\`email\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v_blocks_about\`("_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "body", "email", "_uuid", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "body", "email", "_uuid", "block_name" FROM \`_pages_v_blocks_about\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_about\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v_blocks_about\` RENAME TO \`_pages_v_blocks_about\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_order_idx\` ON \`_pages_v_blocks_about\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_parent_id_idx\` ON \`_pages_v_blocks_about\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_about_path_idx\` ON \`_pages_v_blocks_about\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v_blocks_core_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`header_icon\` text,
  	\`header_eyebrow\` text,
  	\`header_title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v_blocks_core_values\`("_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "_uuid", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "_uuid", "block_name" FROM \`_pages_v_blocks_core_values\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_core_values\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v_blocks_core_values\` RENAME TO \`_pages_v_blocks_core_values\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_core_values_order_idx\` ON \`_pages_v_blocks_core_values\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_core_values_parent_id_idx\` ON \`_pages_v_blocks_core_values\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_core_values_path_idx\` ON \`_pages_v_blocks_core_values\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v_blocks_vision_mission\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`header_icon\` text,
  	\`header_eyebrow\` text,
  	\`header_title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v_blocks_vision_mission\`("_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "_uuid", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "_uuid", "block_name" FROM \`_pages_v_blocks_vision_mission\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_vision_mission\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v_blocks_vision_mission\` RENAME TO \`_pages_v_blocks_vision_mission\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_vision_mission_order_idx\` ON \`_pages_v_blocks_vision_mission\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_vision_mission_parent_id_idx\` ON \`_pages_v_blocks_vision_mission\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_vision_mission_path_idx\` ON \`_pages_v_blocks_vision_mission\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v_blocks_social\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`header_icon\` text,
  	\`header_eyebrow\` text,
  	\`header_title\` text,
  	\`header_subtitle\` text,
  	\`handle\` text,
  	\`link_label\` text,
  	\`link_type\` text DEFAULT 'internal',
  	\`link_page_id\` integer,
  	\`link_url\` text,
  	\`link_new_tab\` integer DEFAULT false,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v_blocks_social\`("_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "header_subtitle", "handle", "link_label", "link_type", "link_page_id", "link_url", "link_new_tab", "_uuid", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "header_subtitle", "handle", "link_label", "link_type", "link_page_id", "link_url", "link_new_tab", "_uuid", "block_name" FROM \`_pages_v_blocks_social\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_social\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v_blocks_social\` RENAME TO \`_pages_v_blocks_social\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_order_idx\` ON \`_pages_v_blocks_social\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_parent_id_idx\` ON \`_pages_v_blocks_social\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_path_idx\` ON \`_pages_v_blocks_social\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_link_link_page_idx\` ON \`_pages_v_blocks_social\` (\`link_page_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_header\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`cta_label\` text,
  	\`cta_type\` text DEFAULT 'internal',
  	\`cta_page_id\` integer,
  	\`cta_url\` text,
  	\`cta_new_tab\` integer DEFAULT false,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`cta_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_header\`("id", "cta_label", "cta_type", "cta_page_id", "cta_url", "cta_new_tab", "updated_at", "created_at") SELECT "id", "cta_label", "cta_type", "cta_page_id", "cta_url", "cta_new_tab", "updated_at", "created_at" FROM \`header\`;`)
  await db.run(sql`DROP TABLE \`header\`;`)
  await db.run(sql`ALTER TABLE \`__new_header\` RENAME TO \`header\`;`)
  await db.run(sql`CREATE INDEX \`header_cta_cta_page_idx\` ON \`header\` (\`cta_page_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_footer\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`tagline\` text,
  	\`email\` text,
  	\`phone\` text,
  	\`address\` text,
  	\`copyright\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_footer\`("id", "tagline", "email", "phone", "address", "copyright", "updated_at", "created_at") SELECT "id", "tagline", "email", "phone", "address", "copyright", "updated_at", "created_at" FROM \`footer\`;`)
  await db.run(sql`DROP TABLE \`footer\`;`)
  await db.run(sql`ALTER TABLE \`__new_footer\` RENAME TO \`footer\`;`)
}
