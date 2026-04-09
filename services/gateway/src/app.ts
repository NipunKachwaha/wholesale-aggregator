import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import config from "./config";
import logger from "./middleware/logger";
import { apiLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import healthRouter from "./routes/health";

const app: Application = express();

// ── Security Headers
app.use(helmet());

// ── CORS Setup
app.use(
  cors({
    origin: [
      "http://localhost:5173", // React dev server
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logger
app.use(logger);

// ── Rate Limiter (sabhi /api routes par)
app.use("/api", apiLimiter);

// ── Routes
app.use("/health", healthRouter);

// ── Placeholder routes (Step 4+ mein real routes aayenge)
app.get("/api/v1", (req, res) => {
  res.json({
    success: true,
    message: "Wholesale Aggregator API v1",
    version: "1.0.0",
    docs: "/api/v1/docs",
  });
});

// ── 404 Handler
app.use(notFoundHandler);

// ── Global Error Handler
app.use(errorHandler);

export default app;
