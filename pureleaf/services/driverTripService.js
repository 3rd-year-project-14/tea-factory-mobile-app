import apiClient from "./apiClient";

// Get today's tea supply requests for driver
export const getTodayTeaSupplyRequests = async (driverId) => {
  const res = await apiClient.get(`/api/tea-supply-today/${driverId}`);
  return res.data;
};

// Get trip bag summary by trip
export const getTripBagSummaryByTrip = async (tripId) => {
  const res = await apiClient.get(`/api/trip-bags/summary/by-trip/${tripId}`);
  return res.data;
};

// Get trip bag summary by supply request
export const getTripBagSummaryBySupplyRequest = async (supplyRequestId) => {
  const res = await apiClient.get(
    `/api/trip-bags/summary/by-supply-request/${supplyRequestId}`
  );
  return res.data;
};

// Get bag details by supply request and trip
export const getBagDetailsBySupplyRequestAndTrip = async (
  supplyRequestId,
  tripId
) => {
  const res = await apiClient.get(
    `/api/trip-bags/by-supply-request/${supplyRequestId}/trip/${tripId}`
  );
  return res.data;
};

// Add supplier to trip (arrived at pickup)
export const addTripSupplier = async (tripId, supplyRequestId) => {
  const res = await apiClient.post(`/api/trip-suppliers`, {
    tripId,
    supplyRequestId,
  });
  return res.data;
};

// Update trip status (e.g., to 'collected')
export const updateTripStatus = async (tripId, status) => {
  const res = await apiClient.put(`/api/trips/${tripId}/status`, { status });
  return res.data;
};
