import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`aanmeldingen_siblings\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`leeftijd\` text,
  	\`type\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`aanmeldingen\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`aanmeldingen_siblings_order_idx\` ON \`aanmeldingen_siblings\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`aanmeldingen_siblings_parent_id_idx\` ON \`aanmeldingen_siblings\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`aanmeldingen_problematiek\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`aanmeldingen\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`aanmeldingen_problematiek_order_idx\` ON \`aanmeldingen_problematiek\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`aanmeldingen_problematiek_parent_idx\` ON \`aanmeldingen_problematiek\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`aanmeldingen_vorm_van_hulp\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`aanmeldingen\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`aanmeldingen_vorm_van_hulp_order_idx\` ON \`aanmeldingen_vorm_van_hulp\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`aanmeldingen_vorm_van_hulp_parent_idx\` ON \`aanmeldingen_vorm_van_hulp\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`aanmeldingen\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`status\` text DEFAULT 'nieuw',
  	\`client_naam\` text NOT NULL,
  	\`client_geboortedatum\` text NOT NULL,
  	\`client_adres\` text NOT NULL,
  	\`verwijzer_naam\` text NOT NULL,
  	\`verwijzer_organisatie\` text NOT NULL,
  	\`verwijzer_email\` text NOT NULL,
  	\`verwijzer_telefoon\` text NOT NULL,
  	\`moeder_naam\` text NOT NULL,
  	\`moeder_adres\` text NOT NULL,
  	\`moeder_email\` text NOT NULL,
  	\`moeder_telefoon\` text NOT NULL,
  	\`vader_naam\` text NOT NULL,
  	\`vader_adres\` text,
  	\`vader_email\` text,
  	\`vader_telefoon\` text,
  	\`reden_aanmelden\` text NOT NULL,
  	\`hulpverleningsgeschiedenis\` text,
  	\`problematiek_overig\` text,
  	\`dsm_diagnose_bekend\` text,
  	\`privacy_akkoord\` integer DEFAULT false NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`aanmeldingen_updated_at_idx\` ON \`aanmeldingen\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`aanmeldingen_created_at_idx\` ON \`aanmeldingen\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`aanmeldingen_id\` integer REFERENCES aanmeldingen(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_aanmeldingen_id_idx\` ON \`payload_locked_documents_rels\` (\`aanmeldingen_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`aanmeldingen_siblings\`;`)
  await db.run(sql`DROP TABLE \`aanmeldingen_problematiek\`;`)
  await db.run(sql`DROP TABLE \`aanmeldingen_vorm_van_hulp\`;`)
  await db.run(sql`DROP TABLE \`aanmeldingen\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`pages_id\` integer,
  	\`comments_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`comments_id\`) REFERENCES \`comments\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "pages_id", "comments_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "pages_id", "comments_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_comments_id_idx\` ON \`payload_locked_documents_rels\` (\`comments_id\`);`)
}
