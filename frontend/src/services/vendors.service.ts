import api from "./api.service";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const BASE_URL = "http://localhost:3002";

// ── Saare vendors
export const getVendors = async () => {
  const response = await api.get(`${BASE_URL}/catalog/vendors`, {
    params: { tenantId: TENANT_ID },
  });
  return response.data;
};

// ── Naya vendor banao
export const createVendor = async (data: {
  name: string;
  feedType: string;
  apiEndpoint?: string;
}) => {
  const response = await api.post(`${BASE_URL}/catalog/vendors`, {
    ...data,
    tenantId: TENANT_ID,
  });
  return response.data;
};

// ── Vendor sync trigger
export const syncVendor = async (vendorId: string) => {
  const response = await api.post(`${BASE_URL}/catalog/sync/api`, {
    vendorId,
    tenantId: TENANT_ID,
  });
  return response.data;
};
