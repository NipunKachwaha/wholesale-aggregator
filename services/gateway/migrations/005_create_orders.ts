import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTableIfNotExists("orders", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("tenant_id")
      .notNullable()
      .references("id")
      .inTable("tenants")
      .onDelete("CASCADE");
    table.uuid("buyer_id").references("id").inTable("users");
    table
      .enum("status", [
        "draft",
        "confirmed",
        "processing",
        "fulfilled",
        "cancelled",
      ])
      .defaultTo("draft");
    table.jsonb("line_items").defaultTo("[]");
    table.decimal("total_amount", 14, 2);
    table.decimal("ai_suggested_price", 14, 2);
    table.uuid("consolidation_group_id");
    table.text("notes");
    table.timestamp("fulfilled_at");
    table.timestamps(true, true);
  });

  await knex.raw(
    "CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id)",
  );
  await knex.raw(
    "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)",
  );
  await knex.raw(
    "CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id)",
  );

  console.log("✅ Migration 005: orders table created");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("orders");
  console.log("⏪ Rollback 005: orders table dropped");
}
