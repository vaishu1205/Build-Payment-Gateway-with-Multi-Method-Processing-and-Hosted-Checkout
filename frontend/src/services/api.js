import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthHeaders = (apiKey, apiSecret) => {
  api.defaults.headers["X-Api-Key"] = apiKey;
  api.defaults.headers["X-Api-Secret"] = apiSecret;
};

export const createOrder = async (orderData) => {
  const response = await api.post("/api/v1/orders", orderData);
  return response.data;
};

export const getOrder = async (orderId) => {
  const response = await api.get(`/api/v1/orders/${orderId}`);
  return response.data;
};

export const getOrderPublic = async (orderId) => {
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/orders/${orderId}/public`
  );
  return response.data;
};

export const createPayment = async (paymentData) => {
  const response = await api.post("/api/v1/payments", paymentData);
  return response.data;
};

export const getPayment = async (paymentId) => {
  const response = await api.get(`/api/v1/payments/${paymentId}`);
  return response.data;
};

export const getPaymentPublic = async (paymentId) => {
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/payments/${paymentId}`
  );
  return response.data;
};

export const getMerchantStats = async () => {
  const response = await api.get("/api/v1/merchant/stats");
  return response.data;
};

export const getTransactions = async () => {
  const response = await api.get("/api/v1/transactions");
  return response.data;
};

export default api;
