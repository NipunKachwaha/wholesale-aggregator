import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

const config = {
  // Server
  port: parseInt(process.env.AUTH_SERVICE_PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // JWT
  jwtSecret: process.env.JWT_SECRET || "fallback_secret_min_32_chars!!",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",

  // PostgreSQL
  postgres: {
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
    database: process.env.POSTGRES_DB || "wholesale_db",
    user: process.env.POSTGRES_USER || "wholesale_user",
    password: process.env.POSTGRES_PASSWORD || "changeme_dev",
    max: 10, // max connections pool mein
  },

  // Bcrypt
  bcryptRounds: 12,
};

export default config;
