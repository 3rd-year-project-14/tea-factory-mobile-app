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
