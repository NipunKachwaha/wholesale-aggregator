import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTableIfNotExists("products", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("tenant_id")
      .notNullable()
      .references("id")
      .inTable("tenants")
      .onDelete("CASCADE");
    table
      .uuid("vendor_id")
      .references("id")
      .inTable("vendors")
      .onDelete("SET NULL");
    table.string("sku", 255).notNullable();
    table.string("name", 500).notNullable();
    table.string("category", 255);
    table.decimal("base_price", 12, 2);
    table.string("unit", 50);
    table.integer("stock_qty").defaultTo(0);
    table.jsonb("attributes").defaultTo("{}");
    table.jsonb("normalized_data").defaultTo("{}");
    table.boolean("is_active").defaultTo(true);
    table.timestamp("last_synced_at");
    table.timestamps(true, true);

    // Ek tenant mein ek SKU unique hoga
    table.unique(["tenant_id", "sku"]);
  });

  await knex.raw(
    "CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id)",
  );
  await knex.raw(
    "CREATE INDEX IF NOT EXISTS idx_products_sku ON products(tenant_id, sku)",
  );
  await knex.raw(
    "CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)",
  );

  console.log("✅ Migration 004: products table created");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("products");
  console.log("⏪ Rollback 004: products table dropped");
}
