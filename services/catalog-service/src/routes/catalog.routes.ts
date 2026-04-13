import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import config from "../config";
import { syncVendorFeed, getVendorById } from "../sync/syncVendorFeed";
import { getProductsByVendor, findBySku, pool } from "../models/product.model";

const router = Router();

// ── Upload folder banao agar nahi hai
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

// ── Multer setup (CSV upload ke liye)
const storage = multer.diskStorage({
  destination: config.uploadDir,
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Sirf CSV files allowed hain"));
    }
  },
});

// ── GET /catalog/products
// Saare products list karo
router.get("/products", async (req: Request, res: Response) => {
  try {
    const tenantId =
      (req.query.tenantId as string) || "00000000-0000-0000-0000-000000000001";
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "50");
    const category = req.query.category as string;
    const search = req.query.search as string;

    let query = `
      SELECT p.*, v.name as vendor_name
      FROM products p
      LEFT JOIN vendors v ON p.vendor_id = v.id
      WHERE p.tenant_id = $1 AND p.is_active = true
    `;
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (category) {
      query += ` AND p.category = $${paramIndex++}`;
      params.push(category);
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY p.created_at DESC`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        products: result.rows,
        page,
        limit,
        total: result.rowCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ── GET /catalog/products/:sku
// Ek product dhundo
router.get("/products/:sku", async (req: Request, res: Response) => {
  try {
    const tenantId =
      (req.query.tenantId as string) || "00000000-0000-0000-0000-000000000001";
    const product = await findBySku(req.params.sku, tenantId);

    if (!product) {
      res.status(404).json({
        success: false,
        error: "Product nahi mila",
        code: "PRODUCT_NOT_FOUND",
      });
      return;
    }

    res.json({ success: true, data: { product } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /catalog/sync/csv
// CSV file upload karke sync karo
router.post(
  "/sync/csv",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: "CSV file required hai",
          code: "FILE_MISSING",
        });
        return;
      }

      const vendorId = req.body.vendorId;
      const tenantId =
        req.body.tenantId || "00000000-0000-0000-0000-000000000001";

      if (!vendorId) {
        res.status(400).json({
          success: false,
          error: "vendorId required hai",
          code: "VENDOR_ID_MISSING",
        });
        return;
      }

      // Sync chalaao
      const result = await syncVendorFeed(
        {
          id: vendorId,
          tenantId,
          feedType: "csv",
        },
        req.file.path,
      );

      // Upload file delete karo sync ke baad
      fs.unlink(req.file.path, () => {});

      res.json({
        success: true,
        message: "CSV sync complete",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ── POST /catalog/sync/api
// API endpoint se sync karo
router.post("/sync/api", async (req: Request, res: Response) => {
  try {
    const { vendorId, tenantId, apiEndpoint, credentials } = req.body;

    if (!vendorId || !apiEndpoint) {
      res.status(400).json({
        success: false,
        error: "vendorId aur apiEndpoint required hain",
      });
      return;
    }

    const result = await syncVendorFeed({
      id: vendorId,
      tenantId: tenantId || "00000000-0000-0000-0000-000000000001",
      feedType: "api",
      apiEndpoint,
      credentials,
    });

    res.json({
      success: true,
      message: "API sync complete",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /catalog/vendors
router.get("/vendors", async (req: Request, res: Response) => {
  try {
    const tenantId =
      (req.query.tenantId as string) || "00000000-0000-0000-0000-000000000001";

    const result = await pool.query(
      `SELECT id, name, feed_type, api_endpoint,
              reliability_score, is_active, last_synced_at,
              created_at
       FROM vendors
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [tenantId],
    );

    res.json({
      success: true,
      data: { vendors: result.rows },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /catalog/vendors
router.post("/vendors", async (req: Request, res: Response) => {
  try {
    const {
      tenantId = "00000000-0000-0000-0000-000000000001",
      name,
      feedType,
      apiEndpoint,
    } = req.body;

    if (!name || !feedType) {
      res.status(400).json({
        success: false,
        error: "name aur feedType required hain",
      });
      return;
    }

    const result = await pool.query(
      `INSERT INTO vendors
        (tenant_id, name, feed_type, api_endpoint)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [tenantId, name, feedType, apiEndpoint || null],
    );

    res.status(201).json({
      success: true,
      data: { vendor: result.rows[0] },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
