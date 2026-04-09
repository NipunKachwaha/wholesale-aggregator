import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // UUID extension enable karo
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');

  await knex.schema.createTableIfNotExists("tenants", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("name", 255).notNullable();
    table.string("slug", 100).unique().notNullable();
    table.enum("plan", ["starter", "pro", "enterprise"]).defaultTo("starter");
    table.jsonb("settings").defaultTo("{}");
    table.boolean("is_active").defaultTo(true);
    table.timestamps(true, true); // created_at, updated_at
  });

  // Seed: Demo tenant
  await knex("tenants")
    .insert({
      id: "00000000-0000-0000-0000-000000000001",
      name: "Demo Tenant",
      slug: "demo",
      plan: "enterprise",
    })
    .onConflict("id")
    .ignore();

  console.log("✅ Migration 001: tenants table created");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("tenants");
  console.log("⏪ Rollback 001: tenants table dropped");
}
