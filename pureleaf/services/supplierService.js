import apiClient from "./apiClient";

// Get all tea supply requests for a supplier
export const getTeaSupplyRequestsBySupplier = (supplierId) =>
  apiClient.get(`/api/tea-supply-requests/${supplierId}`);

// Create a new tea supply request
export const createTeaSupplyRequest = (supplierId, estimatedBagCount) =>
  apiClient.post("/api/tea-supply-requests", {
    supplierId,
    estimatedBagCount: Number(estimatedBagCount),
  });

// Update bag count for an existing supply request
export const updateTeaSupplyRequestBagCount = (requestId, estimatedBagCount) =>
  apiClient.put(`/api/tea-supply-requests/${requestId}/bag-count`, {
    estimatedBagCount: Number(estimatedBagCount),
  });

// Delete a tea supply request
export const deleteTeaSupplyRequest = (requestId) =>
  apiClient.delete(`/api/tea-supply-requests/${requestId}`);

// Request an advance payment
export const requestAdvance = (
  supplierId,
  requestedAmount,
  paymentMethod,
  purpose = null
) =>
  apiClient.post("/api/advances/request", {
    supplierId,
    requestedAmount: Number(requestedAmount),
    paymentMethod,
    ...(purpose && { purpose }),
  });

// Get advance requests for a supplier
export const getAdvanceRequests = (supplierId) =>
  apiClient.get(`/api/advances/supplier/${supplierId}`);

// Request a loan
export const requestLoan = (supplierId, amount, months) =>
  apiClient.post("/api/loan-requests", {
    supplierId,
    amount: Number(amount),
    months: Number(months),
  });

// Get all loan requests (backend returns list)
export const getLoanRequests = () => apiClient.get("/api/loan-requests");

// Get weights summary for supplier
export const getWeightsSummary = (supplierId, month, year) =>
  apiClient.get(
    `/api/supplierMobileApp/weights/summary?supplierId=${supplierId}&month=${month + 1}&year=${year}`
  );

// Get daily summary for supplier
export const getDailySummary = (supplierId, month, year) =>
  apiClient.get(
    `/api/factory-dashboard/supplier/${supplierId}/daily-summary?month=${month + 1}&year=${year}`
  );
