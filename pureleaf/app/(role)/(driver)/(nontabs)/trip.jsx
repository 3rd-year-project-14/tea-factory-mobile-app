// Trip.jsx
import React, { useState, useEffect } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

// ...existing code...

export default function Trip() {
  const navigation = useNavigation();
  // Remove search and filtering for All Trips
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [arrived, setArrived] = useState(false);
  const [loading, setLoading] = useState(true);
  // ...existing code...
  const router = useRouter();

  useEffect(() => {
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
            // Expecting res.data.requests to be an array of suppliers/trips
            setFilteredSuppliers(res.data.requests || []);
          } catch (err) {
            setFilteredSuppliers([]);
            console.log("Error fetching today's supply:", err);
          }
        } else {
          setFilteredSuppliers([]);
        }
      } catch (err) {
        setFilteredSuppliers([]);
        console.log("Error loading driver data:", err);
      }
      setLoading(false);
    };
    fetchTodaySupply();
  }, []);

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
                <Text style={styles.supplierAddress}>
                  Bags: {selectedSupplier.estimatedBagCount}
                </Text>
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
                              try {
                                // Get tripId from AsyncStorage
                                const tripIdStr =
                                  await AsyncStorage.getItem("tripId");
                                const tripId = Number(tripIdStr);
                                // Get supplyRequestId from selectedSupplier
                                const supplyRequestId =
                                  selectedSupplier.supplyRequestId ||
                                  selectedSupplier.requestId;
                                console.log(
                                  "tripId:",
                                  tripId,
                                  "supplyRequestId:",
                                  supplyRequestId
                                );
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
                              // After successful API call, navigate to pickup
                              router.push("/(role)/(driver)/(nontabs)/pickup");
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
          height: selectedSupplier ? "50%" : "75%",
          maxHeight: selectedSupplier ? "50%" : "75%",
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
            {/* Upcoming Trips label */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 12,
                marginTop: 8,
              }}
            >
              Upcoming Trips
            </Text>
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
              ) : filteredSuppliers.filter(
                  (s) =>
                    (s.requestId || s.supplierId) !==
                    (selectedSupplier.requestId || selectedSupplier.supplierId)
                ).length === 0 ? (
                <Text
                  style={{ color: "#888", fontSize: 16, textAlign: "center" }}
                >
                  No suppliers found.
                </Text>
              ) : (
                filteredSuppliers
                  .filter(
                    (s) =>
                      (s.requestId || s.supplierId) !==
                      (selectedSupplier.requestId ||
                        selectedSupplier.supplierId)
                  )
                  .map((supplier) => (
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
                  <Text style={{ fontSize: 18, color: "#888", marginTop: 8 }}>
                    Loading suppliers...
                  </Text>
                </View>
              ) : filteredSuppliers.length === 0 ? (
                <Text
                  style={{ color: "#888", fontSize: 16, textAlign: "center" }}
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
      </View>
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
