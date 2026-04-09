import { pool, batchUpsertProducts, SyncResult } from "../models/product.model";
import { parseCsvFile } from "../parsers/csvParser";
import { fetchFromApi } from "../parsers/apiParser";
import config from "../config";

// Vendor info ka type
interface VendorInfo {
  id: string;
  tenantId: string;
  feedType: "csv" | "api" | "excel" | "webhook";
  apiEndpoint?: string;
  credentials?: Record<string, string>;
}

// ── Main Sync Function
export const syncVendorFeed = async (
  vendor: VendorInfo,
  filePath?: string, // CSV upload ke liye
): Promise<SyncResult> => {
  const startedAt = new Date();
  console.log(`\n🔄 Sync shuru: Vendor ${vendor.id}`);

  const result: SyncResult = {
    vendorId: vendor.id,
    total: 0,
    inserted: 0,
    updated: 0,
    failed: 0,
    errors: [],
    startedAt,
    endedAt: new Date(),
  };

  try {
    let products = [];
    let parseErrors: string[] = [];
    let skipped = 0;

    // ── Feed Type ke hisaab se parse karo
    if (vendor.feedType === "csv" && filePath) {
      console.log(`📄 CSV file parse kar raha hai: ${filePath}`);

      const parsed = await parseCsvFile(filePath, vendor.tenantId, vendor.id);

      products = parsed.products;
      skipped = parsed.skipped;
      parseErrors = parsed.errors;
    } else if (vendor.feedType === "api" && vendor.apiEndpoint) {
      console.log(`🌐 API se fetch kar raha hai: ${vendor.apiEndpoint}`);

      const parsed = await fetchFromApi(
        vendor.apiEndpoint,
        vendor.tenantId,
        vendor.id,
        vendor.credentials,
      );

      products = parsed.products;
      skipped = parsed.skipped;
      parseErrors = parsed.errors;
    } else {
      throw new Error(
        `Feed type '${vendor.feedType}' ke liye filePath ya apiEndpoint required hai`,
      );
    }

    result.total = products.length + skipped;
    result.errors = parseErrors;

    console.log(`📦 ${products.length} products mila, ${skipped} skip hua`);

    // ── Batch mein DB mein save karo
    if (products.length > 0) {
      const batchResult = await batchUpsertProducts(products);
      result.inserted = batchResult.inserted;
      result.updated = batchResult.updated;
      result.failed = batchResult.failed;
      result.errors.push(...batchResult.errors);
    }

    // ── Vendor ka last_synced_at update karo
    await pool.query(
      `UPDATE vendors SET last_synced_at = NOW() WHERE id = $1`,
      [vendor.id],
    );

    // ── Sync log MongoDB mein save karo (optional — baad mein)
    console.log(`✅ Sync complete:`, {
      inserted: result.inserted,
      updated: result.updated,
      failed: result.failed,
    });
  } catch (error: any) {
    result.errors.push(`Sync failed: ${error.message}`);
    console.error(`❌ Sync error:`, error.message);
  }

  result.endedAt = new Date();
  return result;
};

// ── Database se vendor info fetch karo
export const getVendorById = async (
  vendorId: string,
  tenantId: string,
): Promise<VendorInfo | null> => {
  const result = await pool.query(
    `SELECT id, tenant_id, feed_type, api_endpoint, credentials
     FROM vendors
     WHERE id = $1 AND tenant_id = $2 AND is_active = true`,
    [vendorId, tenantId],
  );

  if (!result.rows[0]) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    tenantId: row.tenant_id,
    feedType: row.feed_type,
    apiEndpoint: row.api_endpoint,
    credentials: row.credentials,
  };
};
