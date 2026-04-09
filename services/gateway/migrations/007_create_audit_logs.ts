import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTableIfNotExists("audit_logs", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("tenant_id").references("id").inTable("tenants");
    table.uuid("user_id").references("id").inTable("users");
    table.string("action", 255).notNullable();
    table.string("entity", 100);
    table.uuid("entity_id");
    table.jsonb("old_data");
    table.jsonb("new_data");
    table.specificType("ip_address", "INET");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.raw(
    "CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id)",
  );
  await knex.raw(
    "CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id)",
  );

  console.log("✅ Migration 007: audit_logs table created");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("audit_logs");
  console.log("⏪ Rollback 007: audit_logs table dropped");
}
