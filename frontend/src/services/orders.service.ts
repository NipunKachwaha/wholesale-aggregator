import api from "./api.service";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const BASE_URL = "http://localhost:3003";

// ── Saare orders
export const getOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const response = await api.get(`${BASE_URL}/orders`, {
    params: {
      tenantId: TENANT_ID,
      page: params?.page || 1,
      limit: params?.limit || 20,
      status: params?.status || undefined,
    },
  });
  return response.data;
};

// ── Ek order
export const getOrderById = async (id: string) => {
  const response = await api.get(`${BASE_URL}/orders/${id}`, {
    params: { tenantId: TENANT_ID },
  });
  return response.data;
};

// ── Naya order banao
export const createOrder = async (data: {
  lineItems: { sku: string; quantity: number; unitPrice: number }[];
  notes?: string;
}) => {
  const response = await api.post(`${BASE_URL}/orders`, {
    ...data,
    tenantId: TENANT_ID,
  });
  return response.data;
};

// ── Status update
export const updateOrderStatus = async (id: string, status: string) => {
  const response = await api.patch(`${BASE_URL}/orders/${id}/status`, {
    status,
    tenantId: TENANT_ID,
  });
  return response.data;
};

// ── Order delete
export const deleteOrder = async (id: string) => {
  const response = await api.delete(`${BASE_URL}/orders/${id}`, {
    params: { tenantId: TENANT_ID },
  });
  return response.data;
};
