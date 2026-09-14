import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`footer_certificates\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_certificates_order_idx\` ON \`footer_certificates\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_certificates_parent_id_idx\` ON \`footer_certificates\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`footer_certificates_image_idx\` ON \`footer_certificates\` (\`image_id\`);`)

  // Preserve the single cert_image_id as the first array row before the column is dropped.
  await db.run(sql`INSERT INTO \`footer_certificates\` ("_order", "_parent_id", "id", "image_id")
    SELECT 1, "id", 'migrated-cert-' || "id", "cert_image_id"
    FROM \`footer\`
    WHERE "cert_image_id" IS NOT NULL;`)

  // Drop cert_image_id via recreate. FKs off so footer_certificates rows survive the DROP.
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_footer\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`logo_id\` integer,
  	\`tagline\` text,
  	\`email\` text,
  	\`phone\` text,
  	\`address\` text,
  	\`copyright\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_footer\`("id", "logo_id", "tagline", "email", "phone", "address", "copyright", "updated_at", "created_at") SELECT "id", "logo_id", "tagline", "email", "phone", "address", "copyright", "updated_at", "created_at" FROM \`footer\`;`)
  await db.run(sql`DROP TABLE \`footer\`;`)
  await db.run(sql`ALTER TABLE \`__new_footer\` RENAME TO \`footer\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`footer_logo_idx\` ON \`footer\` (\`logo_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`footer_certificates\`;`)
  await db.run(sql`ALTER TABLE \`footer\` ADD \`cert_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`footer_cert_image_idx\` ON \`footer\` (\`cert_image_id\`);`)
}
