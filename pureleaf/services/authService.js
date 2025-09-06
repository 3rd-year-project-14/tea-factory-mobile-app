import apiClient from "./apiClient";

// Login with Firebase token
export const login = (token) => apiClient.post("/api/auth/login", { token });

// Signup with user data (expects token in data)
export const signup = (data) => apiClient.post("/api/auth/signup", data);

// Get driver data by userId
export const getDriverDataByUserId = (userId) =>
  apiClient.get(`/api/drivers/user/${userId}`);

// Get supplier request data by userId
export const getSupplierRequestByUserId = (userId) =>
  apiClient.get(`/api/supplier-requests?userId=${userId}`);

// Get supplier table data by userId
export const getSupplierTableByUserId = (userId) =>
  apiClient.get(`/api/suppliers/by-user?userId=${userId}`);
