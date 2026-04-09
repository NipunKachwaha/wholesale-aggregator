import app from "./app";
import config from "./config";

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log("─────────────────────────────────────");
  console.log(`✅ API Gateway running`);
  console.log(`🌐 URL:  http://localhost:${PORT}`);
  console.log(`🔍 Health: http://localhost:${PORT}/health`);
  console.log(`📦 Env:  ${config.nodeEnv}`);
  console.log("─────────────────────────────────────");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received — shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\nSIGINT received — shutting down");
  server.close(() => {
    process.exit(0);
  });
});

export default server;
