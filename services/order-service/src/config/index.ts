import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

const config = {
  port: parseInt(process.env.ORDER_SERVICE_PORT || "3003", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  postgres: {
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
    database: process.env.POSTGRES_DB || "wholesale_db",
    user: process.env.POSTGRES_USER || "wholesale_user",
    password: process.env.POSTGRES_PASSWORD || "changeme_dev",
    max: 10,
  },
};

export default config;
