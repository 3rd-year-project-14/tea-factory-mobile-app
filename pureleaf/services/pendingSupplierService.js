import apiClient from "./apiClient";

// Get supplier request status by user ID
export const getPendingSupplierRequestStatusByUser = (userId) =>
  apiClient.get(`/api/supplier-requests/by-user/${userId}`);

// Submit supplier request (multipart/form-data)
export const submitPendingSupplierRequest = (formData) =>
  apiClient.post("/api/supplier-requests", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Get all factories
export const getFactories = () => apiClient.get("/api/factories");
