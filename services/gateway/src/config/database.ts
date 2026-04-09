import knex from "knex";
import config from "./index";

// Knex instance banao
export const db = knex({
  client: "postgresql",
  connection: {
    host: config.postgres.host,
    port: config.postgres.port,
    database: config.postgres.database,
    user: config.postgres.user,
    password: config.postgres.password,
  },
  pool: {
    min: 2,
    max: 10,
    // Connection test
    afterCreate: (conn: any, done: any) => {
      conn.query("SELECT 1", (err: any) => {
        done(err, conn);
      });
    },
  },
});

// Connection test karo
export const testConnection = async (): Promise<boolean> => {
  try {
    await db.raw("SELECT 1");
    console.log("✅ Database connected via Knex");
    return true;
  } catch (error: any) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
};

export default db;
