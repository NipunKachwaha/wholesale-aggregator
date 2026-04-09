import { Pool, PoolClient } from "pg";
import config from "../config";

// PostgreSQL connection pool
export const pool = new Pool(config.postgres);

// User ka type
export interface User {
  id: string;
  tenant_id: string;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  role: "admin" | "purchaser" | "viewer" | "supplier";
  permissions: string[];
  mfa_enabled: boolean;
  last_login: Date | null;
  is_active: boolean;
  created_at: Date;
}

// Safe user — password_hash nahi hoga (frontend ko bhejte hain)
export type SafeUser = Omit<User, "password_hash">;

// ── Email se user dhundo
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query<User>(
    `SELECT * FROM users 
     WHERE email = $1 AND is_active = true
     LIMIT 1`,
    [email.toLowerCase().trim()],
  );
  return result.rows[0] || null;
};

// ── ID se user dhundo
export const findUserById = async (id: string): Promise<User | null> => {
  const result = await pool.query<User>(
    `SELECT * FROM users 
     WHERE id = $1 AND is_active = true
     LIMIT 1`,
    [id],
  );
  return result.rows[0] || null;
};

// ── Naya user banao
export const createUser = async (data: {
  tenantId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role?: string;
}): Promise<SafeUser> => {
  const result = await pool.query<SafeUser>(
    `INSERT INTO users 
      (tenant_id, email, password_hash, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, tenant_id, email, first_name, last_name, 
               role, permissions, mfa_enabled, is_active, created_at`,
    [
      data.tenantId,
      data.email.toLowerCase().trim(),
      data.passwordHash,
      data.firstName,
      data.lastName,
      data.role || "viewer",
    ],
  );
  return result.rows[0];
};

// ── Last login update karo
export const updateLastLogin = async (userId: string): Promise<void> => {
  await pool.query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [
    userId,
  ]);
};

// ── Email already exist karta hai?
export const emailExists = async (email: string): Promise<boolean> => {
  const result = await pool.query(
    `SELECT id FROM users WHERE email = $1 LIMIT 1`,
    [email.toLowerCase().trim()],
  );
  return result.rows.length > 0;
};
