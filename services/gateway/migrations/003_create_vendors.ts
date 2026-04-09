import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTableIfNotExists("vendors", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("tenant_id")
      .notNullable()
      .references("id")
      .inTable("tenants")
      .onDelete("CASCADE");
    table.string("name", 255).notNullable();
    table.text("api_endpoint");
    table.enum("feed_type", ["api", "csv", "excel", "webhook"]);
    table.jsonb("credentials").defaultTo("{}");
    table.string("sync_schedule", 100).defaultTo("0 */6 * * *");
    table.float("reliability_score").defaultTo(1.0);
    table.boolean("is_active").defaultTo(true);
    table.timestamp("last_synced_at");
    table.timestamps(true, true);
  });

  await knex.raw(
    "CREATE INDEX IF NOT EXISTS idx_vendors_tenant ON vendors(tenant_id)",
  );

  console.log("✅ Migration 003: vendors table created");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("vendors");
  console.log("⏪ Rollback 003: vendors table dropped");
}
