import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import orderRouter from "./routes/order.routes";
import paymentRouter from './routes/payment.routes'

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
app.use('/payments', paymentRouter)

// ── Routes
app.use("/orders", orderRouter);

// ── Health
app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "order-service",
    status: "ok",
  });
});

export default app;
