import axios from "axios";
import { Product } from "../models/product.model";

// API response normalize karo
const normalizeApiProduct = (
  item: Record<string, any>,
  tenantId: string,
  vendorId: string,
): Product | null => {
  // Common field patterns try karo
  const sku = item.sku || item.code || item.product_code || item.id;
  const name = item.name || item.title || item.product_name || item.description;

  if (!sku || !name) return null;

  return {
    tenant_id: tenantId,
    vendor_id: vendorId,
    sku: String(sku).trim(),
    name: String(name).trim(),
    category: item.category || item.type || null,
    base_price: item.price || item.base_price || item.unit_price || null,
    unit: item.unit || item.uom || null,
    stock_qty: item.stock || item.quantity || item.stock_qty || 0,
    attributes: {
      raw_id: item.id,
      vendor_data: item,
    },
    normalized_data: item,
  };
};

// REST API se products fetch karo
export const fetchFromApi = async (
  endpoint: string,
  tenantId: string,
  vendorId: string,
  credentials?: Record<string, string>,
): Promise<{
  products: Product[];
  skipped: number;
  errors: string[];
}> => {
  const products: Product[] = [];
  const errors: string[] = [];
  let skipped = 0;

  try {
    // Headers banao
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // API key ya Bearer token add karo
    if (credentials?.apiKey) {
      headers["X-API-Key"] = credentials.apiKey;
    }
    if (credentials?.bearerToken) {
      headers["Authorization"] = `Bearer ${credentials.bearerToken}`;
    }

    const response = await axios.get(endpoint, {
      headers,
      timeout: 30000, // 30 second timeout
    });

    // Response array hai ya object?
    let items: any[] = [];

    if (Array.isArray(response.data)) {
      items = response.data;
    } else if (Array.isArray(response.data?.products)) {
      items = response.data.products;
    } else if (Array.isArray(response.data?.data)) {
      items = response.data.data;
    } else if (Array.isArray(response.data?.items)) {
      items = response.data.items;
    } else {
      throw new Error("API response mein products array nahi mila");
    }

    // Har item normalize karo
    for (const item of items) {
      const product = normalizeApiProduct(item, tenantId, vendorId);
      if (product) {
        products.push(product);
      } else {
        skipped++;
        errors.push(
          `Item ${JSON.stringify(item).slice(0, 50)}: SKU ya Name missing`,
        );
      }
    }
  } catch (error: any) {
    errors.push(`API fetch error: ${error.message}`);
  }

  return { products, skipped, errors };
};
