import { parse } from "csv-parse";
import fs from "fs";
import { Product } from "../models/product.model";

// CSV ke alag alag field names → standard names mein map karo
const FIELD_MAP: Record<string, string> = {
  // SKU variations
  sku: "sku",
  product_code: "sku",
  item_code: "sku",
  code: "sku",

  // Name variations
  name: "name",
  product_name: "name",
  prod_name: "name",
  title: "name",
  description: "name",
  item_name: "name",

  // Price variations
  price: "base_price",
  base_price: "base_price",
  unit_price: "base_price",
  cost: "base_price",
  rate: "base_price",

  // Category variations
  category: "category",
  cat: "category",
  type: "category",
  product_type: "category",

  // Unit variations
  unit: "unit",
  uom: "unit",
  measure: "unit",

  // Stock variations
  stock: "stock_qty",
  stock_qty: "stock_qty",
  quantity: "stock_qty",
  qty: "stock_qty",
  inventory: "stock_qty",
};

// Raw CSV row normalize karo
const normalizeRow = (
  row: Record<string, string>,
  tenantId: string,
  vendorId: string,
): Product | null => {
  const normalized: Record<string, any> = {};
  const attributes: Record<string, any> = {};

  // Har field ko map karo
  for (const [key, value] of Object.entries(row)) {
    const cleanKey = key.toLowerCase().trim().replace(/\s+/g, "_");
    const mappedField = FIELD_MAP[cleanKey];

    if (mappedField) {
      normalized[mappedField] = value.trim();
    } else {
      // Map nahi hua toh attributes mein rakh do
      attributes[cleanKey] = value.trim();
    }
  }

  // SKU aur Name zaroori hain
  if (!normalized.sku || !normalized.name) {
    return null;
  }

  return {
    tenant_id: tenantId,
    vendor_id: vendorId,
    sku: String(normalized.sku).trim(),
    name: String(normalized.name).trim(),
    category: normalized.category || null,
    base_price: normalized.base_price
      ? parseFloat(normalized.base_price)
      : null,
    unit: normalized.unit || null,
    stock_qty: normalized.stock_qty ? parseInt(normalized.stock_qty) : 0,
    attributes,
    normalized_data: normalized,
  };
};

// CSV file parse karo
export const parseCsvFile = async (
  filePath: string,
  tenantId: string,
  vendorId: string,
): Promise<{
  products: Product[];
  skipped: number;
  errors: string[];
}> => {
  return new Promise((resolve, reject) => {
    const products: Product[] = [];
    const errors: string[] = [];
    let skipped = 0;
    let rowNumber = 0;

    const parser = parse({
      columns: true, // pehli row = headers
      skip_empty_lines: true,
      trim: true,
    });

    parser.on("readable", () => {
      let row: Record<string, string>;
      while ((row = parser.read()) !== null) {
        rowNumber++;
        const product = normalizeRow(row, tenantId, vendorId);

        if (product) {
          products.push(product);
        } else {
          skipped++;
          errors.push(`Row ${rowNumber}: SKU ya Name missing — skip kiya`);
        }
      }
    });

    parser.on("error", (err) => {
      reject(new Error(`CSV parse error: ${err.message}`));
    });

    parser.on("end", () => {
      resolve({ products, skipped, errors });
    });

    // File stream banao
    fs.createReadStream(filePath).pipe(parser);
  });
};

// CSV string directly parse karo (API se aata hai tab)
export const parseCsvString = async (
  csvString: string,
  tenantId: string,
  vendorId: string,
): Promise<{
  products: Product[];
  skipped: number;
  errors: string[];
}> => {
  return new Promise((resolve, reject) => {
    const products: Product[] = [];
    const errors: string[] = [];
    let skipped = 0;
    let rowNumber = 0;

    parse(
      csvString,
      {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      },
      (err, rows: Record<string, string>[]) => {
        if (err) {
          reject(new Error(`CSV parse error: ${err.message}`));
          return;
        }

        for (const row of rows) {
          rowNumber++;
          const product = normalizeRow(row, tenantId, vendorId);

          if (product) {
            products.push(product);
          } else {
            skipped++;
            errors.push(`Row ${rowNumber}: SKU ya Name missing`);
          }
        }

        resolve({ products, skipped, errors });
      },
    );
  });
};
