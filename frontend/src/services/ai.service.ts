import axios from "axios";

const aiApi = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Price Optimization
export const optimizePrice = async (data: {
  sku: string;
  tenant_id: string;
  current_price: number;
  category?: string;
  stock_qty?: number;
  competitor_prices?: number[];
}) => {
  const response = await aiApi.post("/ai/optimize-price", data);
  return response.data;
};

// ── Demand Forecast
export const forecastDemand = async (data: {
  sku: string;
  tenant_id: string;
  days?: number;
}) => {
  const response = await aiApi.post("/ai/forecast-demand", data);
  return response.data;
};

// ── Health Check
export const checkAiHealth = async () => {
  const response = await aiApi.get("/health");
  return response.data;
};

export default aiApi;
