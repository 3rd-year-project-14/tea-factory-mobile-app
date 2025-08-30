import apiClient from "./apiClient";

// Get not-assigned bag numbers for a route
export const getNotAssignedBagNumbers = async (routeId) => {
  const res = await apiClient.get(
    `/api/bags/route/${routeId}/not-assigned-bag-numbers`
  );
  return res.data;
};

// Batch add trip bags
export const batchAddTripBags = async (bagsPayload) => {
  const res = await apiClient.post(`/api/trip-bags/batch`, bagsPayload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};
