// ── User Types
export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "purchaser" | "viewer" | "supplier";
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// ── Product Types
export interface Product {
  id: string;
  tenantId: string;
  vendorId?: string;
  sku: string;
  name: string;
  category?: string;
  basePrice?: number;
  unit?: string;
  stockQty?: number;
  isActive: boolean;
}

// ── Order Types
export type OrderStatus =
  | "draft"
  | "confirmed"
  | "processing"
  | "fulfilled"
  | "cancelled";

export interface LineItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  tenantId: string;
  buyerId?: string;
  status: OrderStatus;
  lineItems: LineItem[];
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Vendor Types
export interface Vendor {
  id: string;
  tenantId: string;
  name: string;
  feedType: "api" | "csv" | "excel" | "webhook";
  isActive: boolean;
  reliabilityScore: number;
  lastSyncedAt?: string;
}

// ── API Response Type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
