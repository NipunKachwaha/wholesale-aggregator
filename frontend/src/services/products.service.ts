import api from "./api.service";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

// ── Saare products fetch karo
export const getProducts = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}) => {
  const response = await api.get("http://localhost:3002/catalog/products", {
    params: {
      tenantId: TENANT_ID,
      page: params?.page || 1,
      limit: params?.limit || 50,
      category: params?.category || undefined,
      search: params?.search || undefined,
    },
  });
  return response.data;
};

// ── SKU se product dhundo
export const getProductBySku = async (sku: string) => {
  const response = await api.get(
    `http://localhost:3002/catalog/products/${sku}`,
    { params: { tenantId: TENANT_ID } },
  );
  return response.data;
};

// ── CSV sync trigger karo
export const syncCsvFeed = async (file: File, vendorId: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("vendorId", vendorId);
  formData.append("tenantId", TENANT_ID);

  const response = await api.post(
    "http://localhost:3002/catalog/sync/csv",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};
