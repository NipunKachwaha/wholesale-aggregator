import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTableIfNotExists("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("tenant_id")
      .notNullable()
      .references("id")
      .inTable("tenants")
      .onDelete("CASCADE");
    table.string("email", 255).unique().notNullable();
    table.string("password_hash", 255).notNullable();
    table.string("first_name", 100);
    table.string("last_name", 100);
    table
      .enum("role", ["admin", "purchaser", "viewer", "supplier"])
      .defaultTo("viewer");
    table.specificType("permissions", "TEXT[]").defaultTo("{}");
    table.boolean("mfa_enabled").defaultTo(false);
    table.timestamp("last_login");
    table.boolean("is_active").defaultTo(true);
    table.timestamps(true, true);
  });

  // Index banao
  await knex.raw("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");
  await knex.raw(
    "CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id)",
  );

  // Seed: Admin user (password: Admin@1234)
  await knex("users")
    .insert({
      tenant_id: "00000000-0000-0000-0000-000000000001",
      email: "admin@demo.com",
      password_hash:
        "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQOM5G4W",
      first_name: "Admin",
      last_name: "User",
      role: "admin",
    })
    .onConflict("email")
    .ignore();

  console.log("✅ Migration 002: users table created");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
  console.log("⏪ Rollback 002: users table dropped");
}
