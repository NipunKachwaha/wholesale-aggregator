import rateLimit from "express-rate-limit";
import config from "../config";

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests, please try again after 15 minutes.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  handler: (req, res, next, options) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

// Auth routes ke liye strict limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // sirf 10 login attempts
  message: {
    success: false,
    error: "Too many login attempts, please try again after 15 minutes.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
});
