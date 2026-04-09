import { Request, Response, NextFunction } from "express";
import {
  UserRole,
  Permission,
  ROLE_PERMISSIONS,
} from "../../../../shared/types/roles.types";

// ── Role check karo
// Usage: authorize('admin', 'purchaser')
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required",
        code: "NOT_AUTHENTICATED",
      });
      return;
    }

    const userRole = req.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required: ${allowedRoles.join(" or ")}`,
        code: "FORBIDDEN",
        details: {
          yourRole: userRole,
          requiredRole: allowedRoles,
        },
      });
      return;
    }

    next();
  };
};

// ── Permission check karo
// Usage: requirePermission('orders:approve')
export const requirePermission = (...requiredPermissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required",
        code: "NOT_AUTHENTICATED",
      });
      return;
    }

    const userRole = req.user.role as UserRole;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    const missing = requiredPermissions.filter(
      (perm) => !userPermissions.includes(perm),
    );

    if (missing.length > 0) {
      res.status(403).json({
        success: false,
        error: "Insufficient permissions",
        code: "PERMISSION_DENIED",
        details: {
          missingPermissions: missing,
          yourRole: userRole,
        },
      });
      return;
    }

    next();
  };
};

// ── Apna data ya Admin
// Usage: requireSelfOrAdmin('userId')
export const requireSelfOrAdmin = (paramName: string = "userId") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required",
        code: "NOT_AUTHENTICATED",
      });
      return;
    }

    const targetId = req.params[paramName];
    const isAdmin = req.user.role === "admin";
    const isSelf = req.user.userId === targetId;

    if (!isAdmin && !isSelf) {
      res.status(403).json({
        success: false,
        error: "You can only access your own data",
        code: "FORBIDDEN",
      });
      return;
    }

    next();
  };
};

// ── Same Tenant Check
export const requireSameTenant = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
      code: "NOT_AUTHENTICATED",
    });
    return;
  }

  const requestedTenantId = req.params.tenantId || req.query.tenantId;

  if (requestedTenantId && requestedTenantId !== req.user.tenantId) {
    res.status(403).json({
      success: false,
      error: "Cross-tenant access denied",
      code: "CROSS_TENANT_FORBIDDEN",
    });
    return;
  }

  next();
};
