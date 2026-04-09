import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRouter from "./routes/auth.routes";

const app: Application = express();

// ── Security
app.use(helmet());

// ── CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
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
