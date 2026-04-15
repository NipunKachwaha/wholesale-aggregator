import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import config from "./config";
import logger from "./middleware/logger";
import { apiLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import healthRouter from "./routes/health";
import protectedRouter from "./routes/protected";
import eventsRouter from './routes/events'

const app: Application = express();

// ── Security
app.use(helmet());

// ── CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Logger
app.use(logger);

// ── Rate Limiter
app.use("/api", apiLimiter);

// ── Routes
app.use("/health", healthRouter);
app.use("/api/v1/test", protectedRouter);

// ── API Info
app.get("/api/v1", (req, res) => {
  res.json({
    success: true,
    message: "Wholesale Aggregator API v1",
    version: "1.0.0",
  });
});

// WS Stats
app.get('/ws/stats', (req, res) => {
  const { getConnectedCount } = require('./websocket/ws.server')
  res.json({
    success:    true,
    connected:  getConnectedCount(),
    timestamp:  new Date().toISOString(),
  })
})

app.use('/internal/events', eventsRouter)

// ── 404
app.use(notFoundHandler);

// ── Error Handler
app.use(errorHandler);

export default app;
