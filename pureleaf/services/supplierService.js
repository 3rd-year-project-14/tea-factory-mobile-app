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

// Edit an advance request
export const editAdvanceRequest = (
  advanceId,
  supplierId,
  requestedAmount,
  purpose,
  paymentMethod
) =>
  apiClient.put(`/api/advances/${advanceId}`, {
    supplierId: Number(supplierId),
    requestedAmount: Number(requestedAmount),
    purpose,
    paymentMethod,
  });

// Delete an advance request
export const deleteAdvanceRequest = (advanceId) =>
  apiClient.delete(`/api/advances/${advanceId}`);

// Request a loan
export const requestLoan = (supplierId, amount, months) =>
  apiClient.post("/api/loan-requests", {
    supplierId,
    amount: Number(amount),
    months: Number(months),
  });

// Get loan requests for a supplier
export const getLoanRequestsBySupplier = (supplierId) =>
  apiClient.get(`/api/loan-requests/supplier/${supplierId}`);

// Edit a loan request
export const editLoanRequest = (loanId, supplierId, amount, months) =>
  apiClient.put(`/api/loan-requests/${loanId}`, {
    supplierId: Number(supplierId),
    amount: Number(amount),
    months: Number(months),
  });

// Delete a loan request
export const deleteLoanRequest = (loanId) =>
  apiClient.delete(`/api/loan-requests/${loanId}`);

// Get loans for a supplier
export const getLoansBySupplier = (supplierId) =>
  apiClient.get(`/api/loans/supplier/${supplierId}`);

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


  // Create supplier fertilizer request
export const createSupplierFertilizerRequest = (dto) =>
  apiClient.post('/api/supplier-fertilizer-requests', dto);

// Get payment history for a supplier
export const getPaymentHistory = (supplierId, month, year) =>
  apiClient.get(
    `/api/supplier/payments/history?supplierId=${supplierId}&month=${month}&year=${year}`
  );

// Get dashboard summary for supplier
export const getDashboardSummary = (supplierId, month, year) =>
  apiClient.get(
    `/api/supplier/payments/dashboard-summary?supplierId=${supplierId}&month=${month}&year=${year}`
  );


