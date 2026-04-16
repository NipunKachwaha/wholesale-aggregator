import { pool, Order, LineItem } from "../models/order.model";

interface ConsolidationGroup {
  groupId: string;
  orders: Order[];
  merged: LineItem[];
  total: number;
  saving: number;
}

// ── Same SKUs wale draft orders dhundo
export const findConsolidatableOrders = async (
  tenantId: string,
): Promise<Order[]> => {
  const result = await pool.query<Order>(
    `SELECT * FROM orders
     WHERE tenant_id   = $1
       AND status      = 'draft'
       AND consolidation_group_id IS NULL
     ORDER BY created_at DESC
     LIMIT 50`,
    [tenantId],
  );
  return result.rows;
};

// ── Orders ko group karo same SKUs ke basis pe
export const groupOrdersBySkus = (orders: Order[]): Map<string, Order[]> => {
  const groups = new Map<string, Order[]>();

  for (const order of orders) {
    const items = Array.isArray(order.line_items)
      ? order.line_items
      : JSON.parse((order.line_items as any) || "[]");

    // SKUs sort karke key banao
    const key = items
      .map((i: LineItem) => i.sku)
      .sort()
      .join(",");

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(order);
  }

  // Sirf 2+ orders wale groups return karo
  const result = new Map<string, Order[]>();
  groups.forEach((grpOrders, key) => {
    if (grpOrders.length >= 2) {
      result.set(key, grpOrders);
    }
  });

  return result;
};

// ── Orders merge karo
export const mergeLineItems = (
  orders: Order[],
): { items: LineItem[]; originalTotal: number } => {
  const skuMap = new Map<string, LineItem>();
  let totalAmt = 0;

  for (const order of orders) {
    const items = Array.isArray(order.line_items)
      ? order.line_items
      : JSON.parse((order.line_items as any) || "[]");

    totalAmt += Number(order.total_amount) || 0;

    for (const item of items) {
      if (skuMap.has(item.sku)) {
        const existing = skuMap.get(item.sku)!;
        existing.quantity += item.quantity;
        existing.total = existing.quantity * existing.unitPrice;
      } else {
        skuMap.set(item.sku, { ...item });
      }
    }
  }

  return {
    items: Array.from(skuMap.values()),
    originalTotal: totalAmt,
  };
};

// ── Consolidate karo — main function
export const consolidateOrders = async (
  orderIds: string[],
  tenantId: string,
): Promise<{
  success: boolean;
  consolidatedOrder?: any;
  cancelledOrders?: string[];
  saving?: number;
  error?: string;
}> => {
  if (orderIds.length < 2) {
    return {
      success: false,
      error: "Kam se kam 2 orders chahiye consolidation ke liye",
    };
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Orders fetch karo
    const placeholders = orderIds.map((_, i) => `$${i + 2}`).join(",");
    const result = await client.query<Order>(
      `SELECT * FROM orders
       WHERE id = ANY(ARRAY[${placeholders}]::uuid[])
         AND tenant_id = $1
         AND status = 'draft'`,
      [tenantId, ...orderIds],
    );

    if (result.rows.length !== orderIds.length) {
      await client.query("ROLLBACK");
      return {
        success: false,
        error: "Kuch orders nahi mile ya draft status mein nahi hain",
      };
    }

    const orders = result.rows;

    // Line items merge karo
    const { items, originalTotal } = mergeLineItems(orders);
    const newTotal = items.reduce((sum, i) => sum + i.total, 0);

    // Bulk discount — 5% agar 3+ orders
    const discount = orders.length >= 3 ? 0.05 : 0;
    const finalTotal = newTotal * (1 - discount);
    const saving = originalTotal - finalTotal;

    // Group ID banao
    const groupId = `grp_${Date.now()}`;

    // Naya consolidated order banao
    const newOrder = await client.query(
      `INSERT INTO orders
        (tenant_id, status, line_items, total_amount,
         consolidation_group_id, notes)
       VALUES ($1, 'draft', $2, $3, $4, $5)
       RETURNING *`,
      [
        tenantId,
        JSON.stringify(items),
        finalTotal.toFixed(2),
        groupId,
        `${orders.length} orders se consolidated. Saving: ₹${saving.toFixed(2)}`,
      ],
    );

    // Purane orders cancel karo
    await client.query(
      `UPDATE orders
       SET status = 'cancelled',
           consolidation_group_id = $1,
           notes = CONCAT(COALESCE(notes,''), ' [Consolidated]')
       WHERE id = ANY(ARRAY[${placeholders}]::uuid[])
         AND tenant_id = $2`,
      [groupId, tenantId, ...orderIds],
    );

    await client.query("COMMIT");

    return {
      success: true,
      consolidatedOrder: newOrder.rows[0],
      cancelledOrders: orderIds,
      saving: Number(saving.toFixed(2)),
    };
  } catch (error: any) {
    await client.query("ROLLBACK");
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
};

// ── Auto-consolidation suggestions
export const getConsolidationSuggestions = async (
  tenantId: string,
): Promise<ConsolidationGroup[]> => {
  const orders = await findConsolidatableOrders(tenantId);
  const groups = groupOrdersBySkus(orders);
  const suggestions: ConsolidationGroup[] = [];

  groups.forEach((grpOrders, key) => {
    const { items, originalTotal } = mergeLineItems(grpOrders);
    const discount = grpOrders.length >= 3 ? 0.05 : 0;
    const newTotal = items.reduce((s, i) => s + i.total, 0);
    const finalTotal = newTotal * (1 - discount);

    suggestions.push({
      groupId: `suggest_${key}`,
      orders: grpOrders,
      merged: items,
      total: Number(finalTotal.toFixed(2)),
      saving: Number((originalTotal - finalTotal).toFixed(2)),
    });
  });

  return suggestions;
};
