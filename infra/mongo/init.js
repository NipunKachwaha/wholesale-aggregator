// MongoDB initialization script
db = db.getSiblingDB("wholesale_catalog");

// Collections banao
db.createCollection("product_catalogs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["tenantId", "vendorId", "sku"],
      properties: {
        tenantId: { bsonType: "string" },
        vendorId: { bsonType: "string" },
        sku: { bsonType: "string" },
        rawData: { bsonType: "object" },
        syncedAt: { bsonType: "date" },
      },
    },
  },
});

db.createCollection("vendor_feeds");
db.createCollection("price_history");
db.createCollection("sync_logs");

// Indexes banao
db.product_catalogs.createIndex({ tenantId: 1, sku: 1 }, { unique: true });
db.product_catalogs.createIndex({ vendorId: 1 });
db.price_history.createIndex({ tenantId: 1, sku: 1, recordedAt: -1 });
db.sync_logs.createIndex({ vendorId: 1, startedAt: -1 });

print("MongoDB initialized successfully");
