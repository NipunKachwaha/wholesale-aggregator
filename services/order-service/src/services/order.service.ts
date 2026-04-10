import { pool } from "../models/order.model";
import {
  Order,
  LineItem,
  OrderStatus,
  ALLOWED_TRANSITIONS,
  createOrder,
  findOrderById,
  updateOrderStatus,
} from "../models/order.model";

// ── SKU validate karo products table se
export const validateSkus = async (
  lineItems: LineItem[],
  tenantId: string,
): Promise<{ valid: boolean; invalidSkus: string[] }> => {
  const skus = lineItems.map((item) => item.sku);
  const invalid: string[] = [];

  for (const sku of skus) {
    const result = await pool.query(
      `SELECT sku FROM products
       WHERE sku = $1 AND tenant_id = $2 AND is_active = true`,
      [sku, tenantId],
    );

    if (result.rows.length === 0) {
      invalid.push(sku);
    }
  }

  return {
    valid: invalid.length === 0,
    invalidSkus: invalid,
  };
};

// ── Total amount calculate karo
export const calculateTotal = (lineItems: LineItem[]): number => {
  return lineItems.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    return sum + itemTotal;
  }, 0);
};

// ── Line items enrich karo (product DB se name fetch)
export const enrichLineItems = async (
  lineItems: LineItem[],
  tenantId: string,
): Promise<LineItem[]> => {
  const enriched: LineItem[] = [];

  for (const item of lineItems) {
    const result = await pool.query(
      `SELECT name, vendor_id FROM products
       WHERE sku = $1 AND tenant_id = $2`,
      [item.sku, tenantId],
    );

    const product = result.rows[0];
    enriched.push({
      ...item,
      name: product?.name || item.name || item.sku,
      vendorId: product?.vendor_id || item.vendorId,
      total: item.quantity * item.unitPrice,
    });
  }

  return enriched;
};

// ── Naya order create karo
export const createNewOrder = async (data: {
  tenantId: string;
  buyerId?: string;
  lineItems: LineItem[];
  notes?: string;
}): Promise<{ success: boolean; order?: Order; error?: string }> => {
  // 1. SKUs validate karo
  const { valid, invalidSkus } = await validateSkus(
    data.lineItems,
    data.tenantId,
  );

  if (!valid) {
    return {
      success: false,
      error: `Yeh SKUs catalog mein nahi hain: ${invalidSkus.join(", ")}`,
    };
  }

  // 2. Line items enrich karo
  const enrichedItems = await enrichLineItems(data.lineItems, data.tenantId);

  // 3. Total calculate karo
  const totalAmount = calculateTotal(enrichedItems);

  // 4. Order banao
  const order = await createOrder({
    tenant_id: data.tenantId,
    buyer_id: data.buyerId,
    line_items: enrichedItems,
    total_amount: totalAmount,
    notes: data.notes,
    status: "draft",
  });

  return { success: true, order };
};

// ── Order status transition karo
export const transitionOrderStatus = async (
  orderId: string,
  tenantId: string,
  newStatus: OrderStatus,
): Promise<{ success: boolean; order?: Order; error?: string }> => {
  // 1. Order dhundo
  const order = await findOrderById(orderId, tenantId);
  if (!order) {
    return { success: false, error: "Order nahi mila" };
  }

  const currentStatus = order.status as OrderStatus;

  // 2. Transition allowed hai?
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: `'${currentStatus}' se '${newStatus}' transition allowed nahi hai. Allowed: ${allowed.join(", ") || "koi nahi"}`,
    };
  }

  // 3. Status update karo
  const updated = await updateOrderStatus(orderId, tenantId, newStatus);
  return { success: true, order: updated! };
};
