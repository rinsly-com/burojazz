import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_social\` ADD \`photos_arrow_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`pages_blocks_social\` ADD \`photos_instagram_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_photos_photos_arrow_idx\` ON \`pages_blocks_social\` (\`photos_arrow_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_photos_photos_instagram_idx\` ON \`pages_blocks_social\` (\`photos_instagram_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_social\` ADD \`photos_arrow_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_social\` ADD \`photos_instagram_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_photos_photos_arrow_idx\` ON \`_pages_v_blocks_social\` (\`photos_arrow_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_photos_photos_instagram_idx\` ON \`_pages_v_blocks_social\` (\`photos_instagram_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
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
  	\`photos_toys_id\` integer,
  	\`photos_gym_id\` integer,
  	\`photos_boxing_id\` integer,
  	\`photos_figures_id\` integer,
  	\`photos_phone_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`photos_toys_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`photos_gym_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`photos_boxing_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`photos_figures_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`photos_phone_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages_blocks_social\`("_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "header_subtitle", "handle", "link_label", "link_type", "link_page_id", "link_url", "link_new_tab", "photos_toys_id", "photos_gym_id", "photos_boxing_id", "photos_figures_id", "photos_phone_id", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "header_subtitle", "handle", "link_label", "link_type", "link_page_id", "link_url", "link_new_tab", "photos_toys_id", "photos_gym_id", "photos_boxing_id", "photos_figures_id", "photos_phone_id", "block_name" FROM \`pages_blocks_social\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_social\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_blocks_social\` RENAME TO \`pages_blocks_social\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_order_idx\` ON \`pages_blocks_social\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_parent_id_idx\` ON \`pages_blocks_social\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_path_idx\` ON \`pages_blocks_social\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_link_link_page_idx\` ON \`pages_blocks_social\` (\`link_page_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_photos_photos_toys_idx\` ON \`pages_blocks_social\` (\`photos_toys_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_photos_photos_gym_idx\` ON \`pages_blocks_social\` (\`photos_gym_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_photos_photos_boxing_idx\` ON \`pages_blocks_social\` (\`photos_boxing_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_photos_photos_figures_idx\` ON \`pages_blocks_social\` (\`photos_figures_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_social_photos_photos_phone_idx\` ON \`pages_blocks_social\` (\`photos_phone_id\`);`)
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
  	\`photos_toys_id\` integer,
  	\`photos_gym_id\` integer,
  	\`photos_boxing_id\` integer,
  	\`photos_figures_id\` integer,
  	\`photos_phone_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`photos_toys_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`photos_gym_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`photos_boxing_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`photos_figures_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`photos_phone_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v_blocks_social\`("_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "header_subtitle", "handle", "link_label", "link_type", "link_page_id", "link_url", "link_new_tab", "photos_toys_id", "photos_gym_id", "photos_boxing_id", "photos_figures_id", "photos_phone_id", "_uuid", "block_name") SELECT "_order", "_parent_id", "_path", "id", "header_icon", "header_eyebrow", "header_title", "header_subtitle", "handle", "link_label", "link_type", "link_page_id", "link_url", "link_new_tab", "photos_toys_id", "photos_gym_id", "photos_boxing_id", "photos_figures_id", "photos_phone_id", "_uuid", "block_name" FROM \`_pages_v_blocks_social\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_social\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v_blocks_social\` RENAME TO \`_pages_v_blocks_social\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_order_idx\` ON \`_pages_v_blocks_social\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_parent_id_idx\` ON \`_pages_v_blocks_social\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_path_idx\` ON \`_pages_v_blocks_social\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_link_link_page_idx\` ON \`_pages_v_blocks_social\` (\`link_page_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_photos_photos_toys_idx\` ON \`_pages_v_blocks_social\` (\`photos_toys_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_photos_photos_gym_idx\` ON \`_pages_v_blocks_social\` (\`photos_gym_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_photos_photos_boxing_idx\` ON \`_pages_v_blocks_social\` (\`photos_boxing_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_photos_photos_figures_idx\` ON \`_pages_v_blocks_social\` (\`photos_figures_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_social_photos_photos_phone_idx\` ON \`_pages_v_blocks_social\` (\`photos_phone_id\`);`)
}
