import { Pool } from "pg";
import config from "../config";

export const pool = new Pool(config.postgres);

// Product ka type
export interface Product {
  id?: string;
  tenant_id: string;
  vendor_id?: string;
  sku: string;
  name: string;
  category?: string;
  base_price?: number;
  unit?: string;
  stock_qty?: number;
  attributes?: Record<string, any>;
  normalized_data?: Record<string, any>;
  is_active?: boolean;
  last_synced_at?: Date;
}

// Sync result ka type
export interface SyncResult {
  vendorId: string;
  total: number;
  inserted: number;
  updated: number;
  failed: number;
  errors: string[];
  startedAt: Date;
  endedAt: Date;
}

// ── Ek product upsert karo (insert ya update)
export const upsertProduct = async (
  product: Product,
): Promise<"inserted" | "updated"> => {
  const result = await pool.query(
    `INSERT INTO products 
      (tenant_id, vendor_id, sku, name, category, 
       base_price, unit, stock_qty, attributes, 
       normalized_data, last_synced_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW())
     ON CONFLICT (tenant_id, sku)
     DO UPDATE SET
       name            = EXCLUDED.name,
       category        = EXCLUDED.category,
       base_price      = EXCLUDED.base_price,
       unit            = EXCLUDED.unit,
       stock_qty       = EXCLUDED.stock_qty,
       attributes      = EXCLUDED.attributes,
       normalized_data = EXCLUDED.normalized_data,
       last_synced_at  = NOW(),
       updated_at      = NOW()
     RETURNING (xmax = 0) AS inserted`,
    [
      product.tenant_id,
      product.vendor_id || null,
      product.sku,
      product.name,
      product.category || null,
      product.base_price || null,
      product.unit || null,
      product.stock_qty || 0,
      JSON.stringify(product.attributes || {}),
      JSON.stringify(product.normalized_data || {}),
    ],
  );

  // xmax = 0 matlab naya insert hua, warna update
  return result.rows[0].inserted ? "inserted" : "updated";
};

// ── Batch mein products upsert karo
export const batchUpsertProducts = async (
  products: Product[],
): Promise<{
  inserted: number;
  updated: number;
  failed: number;
  errors: string[];
}> => {
  let inserted = 0;
  let updated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const product of products) {
    try {
      const result = await upsertProduct(product);
      if (result === "inserted") inserted++;
      else updated++;
    } catch (error: any) {
      failed++;
      errors.push(`SKU ${product.sku}: ${error.message}`);
    }
  }

  return { inserted, updated, failed, errors };
};

// ── Vendor ke products fetch karo
export const getProductsByVendor = async (
  vendorId: string,
  tenantId: string,
  page: number = 1,
  limit: number = 50,
): Promise<Product[]> => {
  const offset = (page - 1) * limit;

  const result = await pool.query<Product>(
    `SELECT * FROM products
     WHERE vendor_id = $1 AND tenant_id = $2
       AND is_active = true
     ORDER BY created_at DESC
     LIMIT $3 OFFSET $4`,
    [vendorId, tenantId, limit, offset],
  );

  return result.rows;
};

// ── SKU se product dhundo
export const findBySku = async (
  sku: string,
  tenantId: string,
): Promise<Product | null> => {
  const result = await pool.query<Product>(
    `SELECT * FROM products
     WHERE sku = $1 AND tenant_id = $2
     LIMIT 1`,
    [sku, tenantId],
  );

  return result.rows[0] || null;
};
