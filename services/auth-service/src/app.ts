import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRouter from "./routes/auth.routes";

const app: Application = express();

// ── Security
app.use(helmet());

// ── CORS — frontend allow karo
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Body Parser
app.use(express.json());

// ── Logger
app.use(morgan("dev"));

// ── Routes
app.use("/auth", authRouter);

// ── Health
app.get("/health", (req, res) => {
  res.json({ success: true, service: "auth-service", status: "ok" });
});

export default app;
