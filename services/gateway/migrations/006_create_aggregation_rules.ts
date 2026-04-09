import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTableIfNotExists("aggregation_rules", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("tenant_id")
      .notNullable()
      .references("id")
      .inTable("tenants")
      .onDelete("CASCADE");
    table.string("name", 255).notNullable();
    table.jsonb("conditions").defaultTo("{}");
    table.jsonb("actions").defaultTo("{}");
    table.integer("priority").defaultTo(0);
    table.boolean("is_active").defaultTo(true);
    table.timestamps(true, true);
  });

  console.log("✅ Migration 006: aggregation_rules table created");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("aggregation_rules");
  console.log("⏪ Rollback 006: aggregation_rules table dropped");
}
