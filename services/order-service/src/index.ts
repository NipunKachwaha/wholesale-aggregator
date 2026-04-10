import app from "./app";
import config from "./config";
import { pool } from "./models/order.model";

const PORT = config.port;

pool
  .query("SELECT NOW()")
  .then(() => {
    console.log("✅ PostgreSQL connected");

    app.listen(PORT, () => {
      console.log("─────────────────────────────────────");
      console.log(`✅ Order Service running`);
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
