// ── Roles
export type UserRole = "admin" | "purchaser" | "viewer" | "supplier";

// ── Permissions
export type Permission =
  | "products:read"
  | "products:write"
  | "products:delete"
  | "orders:read"
  | "orders:write"
  | "orders:delete"
  | "orders:approve"
  | "vendors:read"
  | "vendors:write"
  | "vendors:delete"
  | "analytics:read"
  | "analytics:export"
  | "users:read"
  | "users:write"
  | "users:delete"
  | "settings:read"
  | "settings:write";

// ── Har role ke default permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "products:read",
    "products:write",
    "products:delete",
    "orders:read",
    "orders:write",
    "orders:delete",
    "orders:approve",
    "vendors:read",
    "vendors:write",
    "vendors:delete",
    "analytics:read",
    "analytics:export",
    "users:read",
    "users:write",
    "users:delete",
    "settings:read",
    "settings:write",
  ],
  purchaser: [
    "products:read",
    "orders:read",
    "orders:write",
    "orders:approve",
    "vendors:read",
    "analytics:read",
  ],
  viewer: ["products:read", "orders:read", "vendors:read", "analytics:read"],
  supplier: ["products:read", "products:write", "orders:read", "vendors:read"],
};

// ── JWT ke andar jo data hoga
export interface JwtPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ── Express Request mein user add karo
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
