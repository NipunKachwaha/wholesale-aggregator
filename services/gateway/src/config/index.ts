import dotenv from "dotenv";
import path from "path";

// Root .env file load karo
dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

const config = {
  // Server
  port: parseInt(process.env.APP_PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // JWT
  jwtSecret: process.env.JWT_SECRET || "fallback_secret_change_in_prod",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",

  // PostgreSQL
  postgres: {
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
    database: process.env.POSTGRES_DB || "wholesale_db",
    user: process.env.POSTGRES_USER || "wholesale_user",
    password: process.env.POSTGRES_PASSWORD || "changeme_dev",
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || "redispass_dev",
  },

  // AI Service
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
};

export default config;
