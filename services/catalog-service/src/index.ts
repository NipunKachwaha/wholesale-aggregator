import app from "./app";
import config from "./config";
import { pool } from "./models/product.model";

const PORT = config.port;

// DB connection test karo
pool
  .query("SELECT NOW()")
  .then(() => {
    console.log("✅ PostgreSQL connected");

    app.listen(PORT, () => {
      console.log("─────────────────────────────────────");
      console.log(`✅ Catalog Service running`);
      console.log(`🌐 URL:  http://localhost:${PORT}`);
      console.log(`🔍 Health: http://localhost:${PORT}/health`);
      console.log("─────────────────────────────────────");
    });
  })
  .catch((err) => {
    console.error("❌ PostgreSQL connection failed:", err.message);
    process.exit(1);
  });

process.on("SIGTERM", async () => {
  await pool.end();
  process.exit(0);
});
