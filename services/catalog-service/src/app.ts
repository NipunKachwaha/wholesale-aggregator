import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import catalogRouter from "./routes/catalog.routes";

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

// ── Routes
app.use("/catalog", catalogRouter);

// ── Health
app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "catalog-service",
    status: "ok",
  });
});

export default app;
