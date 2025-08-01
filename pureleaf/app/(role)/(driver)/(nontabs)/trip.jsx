// Trip.jsx
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../../../../constants/ApiConfig";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";

export default function Trip() {
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [arrived, setArrived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [supplierToggle, setSupplierToggle] = useState("upcoming");
  const [completedSummaries, setCompletedSummaries] = useState([]);
  const [showCompletedDetails, setShowCompletedDetails] = useState(false);
  const [collectedSummary, setCollectedSummary] = useState(null);
  const [collectedSummaryLoading, setCollectedSummaryLoading] = useState(false);
  const [bagDetailsModalVisible, setBagDetailsModalVisible] = useState(false);
  const [bagDetails, setBagDetails] = useState([]);
  const [bagDetailsLoading, setBagDetailsLoading] = useState(false);
  const [bagDetailsError, setBagDetailsError] = useState(null);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchTodaySupply = async () => {
        setLoading(true);
        try {
          const driverDataStr = await AsyncStorage.getItem("driverData");
          let _driverId = null;
          if (driverDataStr) {
            const driverData = JSON.parse(driverDataStr);
            _driverId = driverData.id || driverData.driverId;
          }
          if (_driverId) {
            try {
              const res = await axios.get(
                `${BASE_URL}/api/tea-supply-today/${_driverId}`
              );
              let requests = res.data.requests || [];
              if (isActive) {
                // Sort only pending suppliers by pickupToRouteStartDistance (ascending)
                const pendingSuppliers = requests
                  .filter((s) => s.status === "pending")
                  .sort(
                    (a, b) =>
                      (a.pickupToRouteStartDistance || 0) -
                      (b.pickupToRouteStartDistance || 0)
                  );
                // Merge sorted pending with the rest (collected etc. keep their order)
                const nonPendingSuppliers = requests.filter(
                  (s) => s.status !== "pending"
                );
                const sortedRequests = [
                  ...pendingSuppliers,
                  ...nonPendingSuppliers,
                ];
                setFilteredSuppliers(sortedRequests);
                // Auto-select nearest pending supplier
                setSelectedSupplier(
                  pendingSuppliers.length > 0 ? pendingSuppliers[0] : null
                );
                setArrived(false);
                // Fetch completed trip summaries
                const tripIdStr = await AsyncStorage.getItem("tripId");
                const tripId = Number(tripIdStr);
                if (tripId) {
                  try {
                    const summaryRes = await axios.get(
                      `${BASE_URL}/api/trip-bags/summary/by-trip/${tripId}`
                    );
                    if (isActive) setCompletedSummaries(summaryRes.data || []);
                  } catch (_err) {
                    if (isActive) setCompletedSummaries([]);
                  }
                } else {
                  if (isActive) setCompletedSummaries([]);
                }
              }
            } catch (err) {
              if (isActive) setFilteredSuppliers([]);
              console.log("Error fetching today's supply:", err);
            }
          } else {
            if (isActive) setFilteredSuppliers([]);
          }
        } catch (err) {
          if (isActive) setFilteredSuppliers([]);
          console.log("Error loading driver data:", err);
        }
        if (isActive) setLoading(false);
      };
      fetchTodaySupply();
      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f8f4", position: "relative" }}>
      {/* Top half: details card for selected supplier (or empty space) */}
      {selectedSupplier && (
        <View
          style={{
            height: "50%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* If collected, show summary card. If pending, show normal card. */}
          <View style={styles.mapSection}>
            <Image
              source={require("../../../../assets/images/map.jpg")}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={styles.mapOverlay}>
              <Text style={styles.supplierCode}>
                ID: {selectedSupplier.supplierId}
              </Text>
              <Text style={styles.supplierName}>
                {selectedSupplier.supplierName}
              </Text>
              <View style={styles.overlayInfoRow}>
                <Ionicons
                  name="cube"
                  size={18}
                  color="#183d2b"
                  style={{ marginRight: 5 }}
                />
                {selectedSupplier.status === "collected" ? (
                  collectedSummaryLoading ? (
                    <View style={{ minHeight: 38, justifyContent: "center" }}>
                      <Text style={{ color: "#888", fontSize: 16 }}>
                        Loading summary...
                      </Text>
                    </View>
                  ) : collectedSummary ? (
                    <View style={{ minHeight: 38, justifyContent: "center" }}>
                      <Text style={styles.supplierAddress}>
                        {collectedSummary.totalBags} Bags -{" "}
                        {collectedSummary.totalWeight} kg
                      </Text>
                    </View>
                  ) : (
                    <View style={{ minHeight: 38, justifyContent: "center" }}>
                      <Text style={{ color: "#888", fontSize: 16 }}>
                        No summary found.
                      </Text>
                    </View>
                  )
                ) : (
                  <View style={{ minHeight: 38, justifyContent: "center" }}>
                    <Text style={styles.supplierAddress}>
                      Bags: {selectedSupplier.estimatedBagCount}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() =>
                  Linking.openURL(`tel:${selectedSupplier.contactNo}`)
                }
              >
                <Ionicons
                  name="call"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.callBtnText}>Call</Text>
              </TouchableOpacity>
              {selectedSupplier.status !== "collected" ? (
                <TouchableOpacity
                  style={styles.goBtn}
                  onPress={() => {
                    if (!arrived) {
                      Alert.alert(
                        "Start Trip",
                        "Do you want to start navigation to the pickup location?",
                        [
                          {
                            text: "Cancel",
                            style: "cancel",
                          },
                          {
                            text: "Yes",
                            onPress: () => {
                              setArrived(true);
                              let url = null;
                              if (selectedSupplier.pickupLocation) {
                                url = selectedSupplier.pickupLocation;
                              }
                              if (url) {
                                Linking.openURL(url);
                              } else {
                                Alert.alert(
                                  "No pickup location available for this supplier."
                                );
                              }
                            },
                          },
                        ]
                      );
                    } else {
                      Alert.alert(
                        "Arrived",
                        "Are you sure you have arrived at the pickup location?",
                        [
                          {
                            text: "Cancel",
                            style: "cancel",
                          },
                          {
                            text: "Yes",
                            onPress: () => {
                              (async () => {
                                let supplyRequestId;
                                try {
                                  // Get tripId from AsyncStorage
                                  const tripIdStr =
                                    await AsyncStorage.getItem("tripId");
                                  const tripId = Number(tripIdStr);
                                  // Get supplyRequestId from selectedSupplier
                                  supplyRequestId =
                                    selectedSupplier.supplyRequestId ||
                                    selectedSupplier.requestId;
                                  if (tripId && supplyRequestId) {
                                    await axios.post(
                                      `${BASE_URL}/api/trip-suppliers`,
                                      {
                                        tripId,
                                        supplyRequestId,
                                      }
                                    );
                                  }
                                } catch (_err) {
                                  Alert.alert(
                                    "Error",
                                    "Failed to update trip supplier."
                                  );
                                  return;
                                }
                                // After successful API call, navigate to pickup and pass supplyRequestId, supplierName, supplierId
                                router.push({
                                  pathname: "/(role)/(driver)/(nontabs)/pickup",
                                  params: {
                                    supplyRequestId,
                                    supplierName: selectedSupplier.supplierName,
                                    supplierId: selectedSupplier.supplierId,
                                  },
                                });
                              })();
                            },
                          },
                        ]
                      );
                    }
                  }}
                >
                  <Text style={styles.goBtnText}>
                    {arrived ? "Arrived" : "GO"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.goBtn}
                  onPress={async () => {
                    if (!collectedSummary) {
                      Alert.alert("No summary found.");
                      return;
                    }
                    setBagDetailsModalVisible(true);
                    setBagDetails([]);
                    setBagDetailsLoading(true);
                    setBagDetailsError(null);
                    try {
                      const tripIdStr = await AsyncStorage.getItem("tripId");
                      const tripId = Number(tripIdStr);
                      const supplyRequestId =
                        selectedSupplier.supplyRequestId ||
                        selectedSupplier.requestId;
                      if (tripId && supplyRequestId) {
                        const res = await axios.get(
                          `${BASE_URL}/api/trip-bags/by-supply-request/${supplyRequestId}/trip/${tripId}`
                        );
                        setBagDetails(res.data || []);
                      } else {
                        setBagDetails([]);
                        setBagDetailsError(
                          "Trip ID or Supply Request ID not found."
                        );
                      }
                    } catch (_err) {
                      setBagDetails([]);
                      setBagDetailsError("Failed to fetch bag details.");
                    }
                    setBagDetailsLoading(false);
                  }}
                >
                  <Text style={styles.goBtnText}>View</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}
      {/* Upcoming suppliers list: 3/4 screen if no supplier selected, 1/2 if selected */}
      <View
        style={{
          backgroundColor: "#fff",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 24,
          paddingTop: 18,
          paddingBottom: 12,
          alignItems: "center",
          height:
            filteredSuppliers.length > 0 &&
            filteredSuppliers.every((s) => s.status !== "pending")
              ? showCompletedDetails
                ? "75%"
                : "50%"
              : selectedSupplier
                ? "50%"
                : "75%",
          maxHeight:
            filteredSuppliers.length > 0 &&
            filteredSuppliers.every((s) => s.status !== "pending")
              ? showCompletedDetails
                ? "75%"
                : "50%"
              : selectedSupplier
                ? "50%"
                : "75%",
          width: "100%",
          alignSelf: "flex-end",
          elevation: 4,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        {selectedSupplier ? (
          <>
            {/* Selected supplier at top of list */}
            <TouchableOpacity
              key={selectedSupplier.requestId || selectedSupplier.supplierId}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: "#eaf2ea",
                width: "100%",
                backgroundColor: "#eaf2ea",
              }}
              onPress={() => {
                setSelectedSupplier(selectedSupplier);
                setArrived(false);
              }}
            >
              <Image
                source={require("../../../../assets/images/propic.jpg")}
                style={styles.supplierAvatar}
              />
              <View>
                <Text style={styles.listSupplierName}>
                  {selectedSupplier.supplierName}
                </Text>
                <Text style={styles.listSupplierBags}>
                  {selectedSupplier.estimatedBagCount} Bags
                </Text>
              </View>
            </TouchableOpacity>
            {/* Toggle for Upcoming/Collected Suppliers */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 8,
                marginBottom: 12,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor:
                    supplierToggle === "upcoming" ? "#183d2b" : "#eaf2ea",
                  paddingVertical: 8,
                  paddingHorizontal: 24,
                  borderRadius: 20,
                  marginRight: 8,
                }}
                onPress={() => setSupplierToggle("upcoming")}
              >
                <Text
                  style={{
                    color: supplierToggle === "upcoming" ? "#fff" : "#183d2b",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Upcoming Trips
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor:
                    supplierToggle === "collected" ? "#183d2b" : "#eaf2ea",
                  paddingVertical: 8,
                  paddingHorizontal: 24,
                  borderRadius: 20,
                }}
                onPress={() => setSupplierToggle("collected")}
              >
                <Text
                  style={{
                    color: supplierToggle === "collected" ? "#fff" : "#183d2b",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Collected Trips
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ width: "100%" }}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {loading ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Ionicons
                    name="refresh"
                    size={36}
                    color="#183d2b"
                    style={{}}
                  />
                  <Text style={{ fontSize: 18, color: "#888", marginTop: 8 }}>
                    Loading suppliers...
                  </Text>
                </View>
              ) : (
                // Filter suppliers based on toggle
                (() => {
                  // Exclude selected supplier from the list
                  let suppliers = filteredSuppliers.filter(
                    (s) =>
                      (s.requestId || s.supplierId) !==
                      (selectedSupplier.requestId ||
                        selectedSupplier.supplierId)
                  );
                  if (supplierToggle === "collected") {
                    // Show only collected suppliers (status === 'collected')
                    suppliers = suppliers.filter(
                      (s) => s.status === "collected"
                    );
                  } else {
                    // Show only upcoming suppliers (status === 'pending')
                    suppliers = suppliers.filter((s) => s.status === "pending");
                  }
                  if (suppliers.length === 0) {
                    return (
                      <Text
                        style={{
                          color: "#888",
                          fontSize: 16,
                          textAlign: "center",
                        }}
                      >
                        No suppliers found.
                      </Text>
                    );
                  }
                  return suppliers.map((supplier) => (
                    <TouchableOpacity
                      key={supplier.requestId || supplier.supplierId}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: "#eaf2ea",
                        width: "100%",
                      }}
                      onPress={async () => {
                        // Force state change to always trigger API and logs
                        setSelectedSupplier(null);
                        setTimeout(async () => {
                          setSelectedSupplier(supplier);
                          setArrived(false);
                          // If collected supplier, fetch summary
                          if (supplier.status === "collected") {
                            setCollectedSummaryLoading(true);
                            setCollectedSummary(null);
                            try {
                              const supplyRequestId =
                                supplier.supplyRequestId || supplier.requestId;
                              if (supplyRequestId) {
                                const res = await axios.get(
                                  `${BASE_URL}/api/trip-bags/summary/by-supply-request/${supplyRequestId}`
                                );
                                setCollectedSummary(res.data || null);
                              } else {
                                setCollectedSummary(null);
                              }
                            } catch (_err) {
                              setCollectedSummary(null);
                            }
                            setCollectedSummaryLoading(false);
                          } else {
                            setCollectedSummary(null);
                          }
                        }, 0);
                      }}
                    >
                      <Image
                        source={require("../../../../assets/images/propic.jpg")}
                        style={styles.supplierAvatar}
                      />
                      <View>
                        <Text style={styles.listSupplierName}>
                          {supplier.supplierName}
                        </Text>
                        <Text style={styles.listSupplierBags}>
                          {supplier.estimatedBagCount} Bags
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ));
                })()
              )}
            </ScrollView>
          </>
        ) : (
          <>
            {/* If all trips are completed (no pending), show completed message and End Trip button */}
            {filteredSuppliers.length > 0 &&
            filteredSuppliers.every((s) => s.status !== "pending") ? (
              <>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    marginBottom: 12,
                    color: "#183d2b",
                    textAlign: "center",
                  }}
                >
                  All Trips Completed
                </Text>
                {showCompletedDetails ? (
                  <View
                    style={{
                      position: "absolute",
                      top: "12.5%",
                      left: 0,
                      right: 0,
                      height: "75%",
                      backgroundColor: "#fff",
                      borderTopLeftRadius: 24,
                      borderTopRightRadius: 24,
                      paddingHorizontal: 24,
                      paddingBottom: 12,
                      zIndex: 100,
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        alignSelf: "flex-end",
                        marginBottom: 8,
                        backgroundColor: "#eaf2ea",
                        borderRadius: 16,
                        paddingVertical: 4,
                        paddingHorizontal: 18,
                        elevation: 1,
                      }}
                      onPress={() => setShowCompletedDetails(false)}
                    >
                      <Text
                        style={{
                          color: "#183d2b",
                          fontWeight: "bold",
                          fontSize: 15,
                        }}
                      >
                        Close
                      </Text>
                    </TouchableOpacity>

                    <ScrollView
                      style={{ width: "100%" }}
                      contentContainerStyle={{ paddingBottom: 48 }}
                    >
                      {completedSummaries.length === 0 ? (
                        <Text
                          style={{
                            color: "#888",
                            fontSize: 16,
                            textAlign: "center",
                          }}
                        >
                          No completed suppliers found.
                        </Text>
                      ) : (
                        completedSummaries.map((summary) => {
                          const supplier = filteredSuppliers.find(
                            (s) =>
                              (s.supplyRequestId || s.requestId) ===
                              summary.supplyRequestId
                          );
                          return (
                            <View
                              key={summary.supplyRequestId}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: 14,
                                borderBottomWidth: 1,
                                borderBottomColor: "#eaf2ea",
                                width: "100%",
                              }}
                            >
                              <Image
                                source={require("../../../../assets/images/propic.jpg")}
                                style={styles.supplierAvatar}
                              />
                              <View>
                                <Text style={styles.listSupplierName}>
                                  {supplier
                                    ? supplier.supplierName
                                    : `Supplier ${summary.supplyRequestId}`}
                                </Text>
                                <Text style={styles.listSupplierBags}>
                                  {summary.totalBags} Bags
                                </Text>
                                <Text style={styles.listSupplierBags}>
                                  {summary.totalWeight} kg
                                </Text>
                              </View>
                            </View>
                          );
                        })
                      )}
                    </ScrollView>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#eaf2ea",
                        borderRadius: 18,
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        alignSelf: "center",
                        marginBottom: 10,
                        elevation: 1,
                      }}
                      onPress={() => setShowCompletedDetails(true)}
                    >
                      <Text
                        style={{
                          color: "#183d2b",
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        Tap to view details
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        marginTop: 20,
                        backgroundColor: "#183d2b",
                        paddingVertical: 14,
                        paddingHorizontal: 40,
                        borderRadius: 24,
                        alignSelf: "center",
                        elevation: 2,
                      }}
                      onPress={async () => {
                        let tripId;
                        try {
                          const tripIdStr =
                            await AsyncStorage.getItem("tripId");
                          tripId = Number(tripIdStr);
                          if (tripId) {
                            await axios.put(
                              `${BASE_URL}/api/trips/${tripId}/complete`
                            );
                            // Clear tripId from AsyncStorage after trip completion
                            await AsyncStorage.removeItem("tripId");
                            // Wait a short delay to ensure backend updates
                            setTimeout(() => {
                              Alert.alert(
                                "Trip Ended",
                                "You have completed all trips!",
                                [
                                  {
                                    text: "OK",
                                    onPress: () => {
                                      router.replace("/(role)/(driver)");
                                    },
                                  },
                                ]
                              );
                            }, 500);
                          } else {
                            Alert.alert("Error", "Trip ID not found.");
                          }
                        } catch (_err) {
                          Alert.alert("Error", "Failed to complete trip.");
                        }
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: 18,
                        }}
                      >
                        END Trip
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            ) : (
              <>
                <Text
                  style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}
                >
                  All Trips
                </Text>
                <ScrollView
                  style={{ width: "100%", flex: 1 }}
                  contentContainerStyle={{ paddingBottom: 16 }}
                >
                  {loading ? (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Ionicons
                        name="refresh"
                        size={36}
                        color="#183d2b"
                        style={{}}
                      />
                      <Text
                        style={{ fontSize: 18, color: "#888", marginTop: 8 }}
                      >
                        Loading suppliers...
                      </Text>
                    </View>
                  ) : filteredSuppliers.length === 0 ? (
                    <Text
                      style={{
                        color: "#888",
                        fontSize: 16,
                        textAlign: "center",
                      }}
                    >
                      No suppliers found.
                    </Text>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <TouchableOpacity
                        key={supplier.requestId || supplier.supplierId}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingVertical: 14,
                          borderBottomWidth: 1,
                          borderBottomColor: "#eaf2ea",
                          width: "100%",
                        }}
                        onPress={() => {
                          setSelectedSupplier(supplier);
                          setArrived(false);
                        }}
                      >
                        {/* If you have supplier image from API, use it here. Otherwise, use a placeholder. */}
                        <Image
                          source={require("../../../../assets/images/propic.jpg")}
                          style={styles.supplierAvatar}
                        />
                        <View>
                          <Text style={styles.listSupplierName}>
                            {supplier.supplierName}
                          </Text>
                          <Text style={styles.listSupplierBags}>
                            {supplier.estimatedBagCount} Bags
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </>
            )}
          </>
        )}
      </View>
      {/* Bag Details Modal */}
      {bagDetailsModalVisible && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setBagDetailsModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bag Details</Text>
            {bagDetailsLoading ? (
              <Text style={styles.modalLoadingText}>Loading...</Text>
            ) : bagDetailsError ? (
              <Text style={styles.modalErrorText}>{bagDetailsError}</Text>
            ) : bagDetails.length === 0 ? (
              <Text style={styles.modalLoadingText}>No bag details found.</Text>
            ) : (
              <>
                <Text style={styles.totalBagsText}>
                  Total Bags: {bagDetails.length}
                </Text>
                <ScrollView
                  style={styles.modalScroll}
                  contentContainerStyle={{ alignItems: "center" }}
                >
                  {bagDetails.map((bag, idx) => (
                    <View
                      key={bag.bagNumber || idx}
                      style={styles.bagRowCompact}
                    >
                      <Text style={styles.bagLabelCompact}>
                        {bag.bagNumber} - {bag.driverWeight} Kg
                        {(() => {
                          const tags = [];
                          if (bag.wet) tags.push("Wet");
                          if (bag.coarse) tags.push("Coarse");
                          return tags.length > 0 ? ` (${tags.join(", ")})` : "";
                        })()}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setBagDetailsModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapSection: {
    width: "100%",
    height: 260,
    position: "relative",
    marginBottom: 10,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    minWidth: "80%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  modalTitle: {
    color: "#183d2b",
    fontWeight: "700",
    fontSize: 20,
    marginBottom: 14,
    textAlign: "center",
  },
  modalLoadingText: {
    color: "#888",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  modalErrorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  modalScroll: {
    maxHeight: 260,
    width: "100%",
    marginBottom: 12,
  },
  modalCloseBtn: {
    backgroundColor: "#183d2b",
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignSelf: "center",
    marginTop: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  totalBagsText: {
    color: "#183d2b",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  modalCloseBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  mapOverlay: {
    position: "absolute",
    bottom: 10,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 18,
    padding: 16,
    alignItems: "flex-start",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  bagRowCompact: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eaf2ea",
  },
  bagLabelCompact: {
    fontSize: 15,
    color: "#183d2b",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  supplierCode: {
    color: "#183d2b",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 2,
  },
  supplierName: {
    color: "#183d2b",
    fontWeight: "700",
    fontSize: 19,
    marginBottom: 2,
  },
  overlayInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    flexWrap: "wrap",
  },
  supplierAddress: {
    color: "#666",
    fontSize: 14,
    marginBottom: 4,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  overlayInfoLabel: {
    color: "#888",
    fontSize: 15,
    fontWeight: "500",
    marginRight: 2,
  },
  overlayInfoValue: {
    color: "#183d2b",
    fontWeight: "700",
    fontSize: 15,
    marginRight: 12,
  },
  goBtn: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: "#183d2b",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginTop: 8,
  },
  goBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 1,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#183d2b",
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 8,
    alignSelf: "flex-start",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  callBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  upcomingTripsLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#183d2b",
    marginLeft: 18,
    marginTop: 4,
    marginBottom: 8,
  },
  supplierListRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginVertical: 6,
    borderRadius: 14,
    padding: 12,
    elevation: 1,
  },
  supplierListRowActive: {
    borderColor: "#183d2b",
    borderWidth: 2,
    backgroundColor: "#eaf2ea",
  },
  supplierAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 14,
    backgroundColor: "#eee",
  },
  listSupplierName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#183d2b",
  },
  listSupplierBags: {
    fontSize: 13,
    color: "#666",
  },
});
