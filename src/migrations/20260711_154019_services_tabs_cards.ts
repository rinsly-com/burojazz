import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_services_tabs_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`number\` text,
  	\`title\` text,
  	\`description\` text,
  	\`link_label\` text,
  	\`link_type\` text DEFAULT 'internal',
  	\`link_page_id\` integer,
  	\`link_url\` text,
  	\`link_new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_services_tabs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_services_tabs_cards_order_idx\` ON \`pages_blocks_services_tabs_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_services_tabs_cards_parent_id_idx\` ON \`pages_blocks_services_tabs_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_services_tabs_cards_link_link_page_idx\` ON \`pages_blocks_services_tabs_cards\` (\`link_page_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_services_tabs_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`number\` text,
  	\`title\` text,
  	\`description\` text,
  	\`link_label\` text,
  	\`link_type\` text DEFAULT 'internal',
  	\`link_page_id\` integer,
  	\`link_url\` text,
  	\`link_new_tab\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_services_tabs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_services_tabs_cards_order_idx\` ON \`_pages_v_blocks_services_tabs_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_services_tabs_cards_parent_id_idx\` ON \`_pages_v_blocks_services_tabs_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_services_tabs_cards_link_link_page_idx\` ON \`_pages_v_blocks_services_tabs_cards\` (\`link_page_id\`);`)
  await db.run(sql`DROP TABLE \`pages_blocks_services_cards\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_services_cards\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_services_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`number\` text,
  	\`title\` text,
  	\`description\` text,
  	\`link_label\` text,
  	\`link_type\` text DEFAULT 'internal',
  	\`link_page_id\` integer,
  	\`link_url\` text,
  	\`link_new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_services_cards_order_idx\` ON \`pages_blocks_services_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_services_cards_parent_id_idx\` ON \`pages_blocks_services_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_services_cards_link_link_page_idx\` ON \`pages_blocks_services_cards\` (\`link_page_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_services_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`number\` text,
  	\`title\` text,
  	\`description\` text,
  	\`link_label\` text,
  	\`link_type\` text DEFAULT 'internal',
  	\`link_page_id\` integer,
  	\`link_url\` text,
  	\`link_new_tab\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_services_cards_order_idx\` ON \`_pages_v_blocks_services_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_services_cards_parent_id_idx\` ON \`_pages_v_blocks_services_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_services_cards_link_link_page_idx\` ON \`_pages_v_blocks_services_cards\` (\`link_page_id\`);`)
  await db.run(sql`DROP TABLE \`pages_blocks_services_tabs_cards\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_services_tabs_cards\`;`)
}
