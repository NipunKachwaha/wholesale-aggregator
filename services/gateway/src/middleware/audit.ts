import { Request, Response, NextFunction } from "express";
import { Pool } from "pg";
import config from "../config";

const pool = new Pool(config.postgres);

export const auditLog = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Response finish pe log karo
  res.on("finish", async () => {
    // Sirf important actions log karo
    const loggedMethods = ["POST", "PUT", "PATCH", "DELETE"];
    const skipPaths = ["/health", "/api/v1"];

    if (!loggedMethods.includes(req.method)) return;
    if (skipPaths.some((p) => req.path.startsWith(p))) return;

    try {
      await pool.query(
        `INSERT INTO audit_logs
          (tenant_id, user_id, action, entity, ip_address)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          req.user?.tenantId || null,
          req.user?.userId || null,
          `${req.method} ${req.path}`,
          req.path.split("/")[3] || "unknown",
          req.ip,
        ],
      );
    } catch {
      // Audit log fail hone se request fail nahi honi chahiye
    }
  });

  next();
};
