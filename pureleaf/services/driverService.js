import apiClient from "./apiClient";

// Get today's trip for a driver
export const getTodayTrip = async (driverId) => {
  const res = await apiClient.get(`/api/trips/today/${driverId}`);
  return res.data;
};

// Get today's driver availability
export const getTodayDriverAvailability = async (driverId) => {
  const res = await apiClient.get(`/api/driver-availability/today/${driverId}`);
  return res.data;
};

// Create driver availability (check-in or not collecting)
export const createDriverAvailability = async (
  driverId,
  isAvailable,
  reason = null
) => {
  const res = await apiClient.post(`/api/driver-availability`, {
    driverId,
    isAvailable,
    reason,
  });
  return res.data;
};

// Update driver availability (edit status or reason)
export const updateDriverAvailability = async (
  availabilityId,
  isAvailable,
  reason = null
) => {
  const res = await apiClient.put(
    `/api/driver-availability/${availabilityId}`,
    {
      isAvailable,
      reason,
    }
  );
  return res.data;
};

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

// Create a new trip
export const createTrip = async (driverId, routeId) => {
  const res = await apiClient.post(`/api/trips`, {
    driverId,
    routeId,
  });
  return res.data;
};

// Update trip status (e.g., to 'arrived')
export const updateTripStatus = async (tripId, status) => {
  const res = await apiClient.put(`/api/trips/${tripId}/status`, { status });
  return res.data;
};

// Get weights summary for driver (monthly)
export const getWeightsSummary = (driverId, month, year) =>
  apiClient.get(
    `/api/driverMobileApp/weights/summary?driverId=${driverId}&month=${month + 1}&year=${year}`
  );
