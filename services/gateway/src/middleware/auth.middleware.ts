import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { JwtPayload } from "../../../../shared/types/roles.types";

// ── JWT Verify Middleware
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // 1. Header se token nikalo
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Authorization token required",
      code: "TOKEN_MISSING",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  // 2. Token verify karo
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        error: "Token expired, please login again",
        code: "TOKEN_EXPIRED",
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: "Invalid token",
      code: "TOKEN_INVALID",
    });
  }
};

// ── Optional Auth
export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
  } catch {
    // Invalid token — guest ki tarah treat karo
  }

  next();
};
