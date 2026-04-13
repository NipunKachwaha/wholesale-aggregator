import { Request, Response, NextFunction } from "express";

export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  res.removeHeader("X-Powered-By");

  next();
};

export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  req.headers["x-request-id"] = id;
  res.setHeader("X-Request-ID", id);
  next();
};
