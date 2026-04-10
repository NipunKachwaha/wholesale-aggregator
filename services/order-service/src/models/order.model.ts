import { Pool } from "pg";
import config from "../config";

export const pool = new Pool(config.postgres);

// ── Types
export type OrderStatus =
  | "draft"
  | "confirmed"
  | "processing"
  | "fulfilled"
  | "cancelled";

export interface LineItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  vendorId?: string;
}

export interface Order {
  id?: string;
  tenant_id: string;
  buyer_id?: string;
  status?: OrderStatus;
  line_items: LineItem[];
  total_amount?: number;
  ai_suggested_price?: number;
  consolidation_group_id?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  fulfilled_at?: Date;
}

// ── Status machine — konse transitions allowed hain
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["fulfilled", "cancelled"],
  fulfilled: [],
  cancelled: [],
};

// ── Order banao
export const createOrder = async (order: Order): Promise<Order> => {
  const result = await pool.query<Order>(
    `INSERT INTO orders
      (tenant_id, buyer_id, status, line_items,
       total_amount, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      order.tenant_id,
      order.buyer_id || null,
      order.status || "draft",
      JSON.stringify(order.line_items),
      order.total_amount || null,
      order.notes || null,
    ],
  );
  return result.rows[0];
};

// ── Order fetch karo by ID
export const findOrderById = async (
  id: string,
  tenantId: string,
): Promise<Order | null> => {
  const result = await pool.query<Order>(
    `SELECT * FROM orders
     WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId],
  );
  return result.rows[0] || null;
};

// ── Saare orders fetch karo
export const findAllOrders = async (
  tenantId: string,
  status?: OrderStatus,
  page: number = 1,
  limit: number = 20,
): Promise<Order[]> => {
  let query = `SELECT * FROM orders WHERE tenant_id = $1`;
  const params: any[] = [tenantId];

  if (status) {
    query += ` AND status = $2`;
    params.push(status);
  }

  query += ` ORDER BY created_at DESC`;
  query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, (page - 1) * limit);

  const result = await pool.query<Order>(query, params);
  return result.rows;
};

// ── Order status update karo
export const updateOrderStatus = async (
  id: string,
  tenantId: string,
  status: OrderStatus,
): Promise<Order | null> => {
  const extra = status === "fulfilled" ? ", fulfilled_at = NOW()" : "";

  const result = await pool.query<Order>(
    `UPDATE orders
     SET status     = $1,
         updated_at = NOW()
         ${extra}
     WHERE id = $2 AND tenant_id = $3
     RETURNING *`,
    [status, id, tenantId],
  );

  return result.rows[0] || null;
};

// ── Order delete karo (sirf draft)
export const deleteOrder = async (
  id: string,
  tenantId: string,
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM orders
     WHERE id = $1 AND tenant_id = $2 AND status = 'draft'`,
    [id, tenantId],
  );
  return (result.rowCount ?? 0) > 0;
};
