import React, { useState, useEffect } from "react";
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  Linking,
  TextInput,
  Pressable,
  AppState,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getTodayTrip,
  getTodayDriverAvailability,
  createDriverAvailability,
  updateDriverAvailability,
  getTodayTeaSupplyRequests,
  getTripBagSummaryByTrip,
  createTrip,
  updateTripStatus,
} from "../../../services/driverService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { usePullToRefresh } from "../../../hooks/usePullToRefresh";

// 6 Sri Lankan supplier samples
const suppliers = [
  {
    id: 1,
    name: "Malikanthi Perera",
    code: "T-101",
    bags: 7,
    image: require("../../../assets/images/propic.jpg"),
    phone: "0771234567",
    fertilizer: 2,
    fertilizerType: "urea",
    address: "No. 45, Temple Road, Gampaha",
  },
  {
    id: 2,
    name: "Saman Kumara",
    code: "T-102",
    bags: 10,
    image: require("../../../assets/images/propic.jpg"),
    phone: "0712345678",
    fertilizer: 3,
    fertilizerType: "urea",
    address: "23/1, Lake View, Kandy",
  },
  {
    id: 3,
    name: "Amal Silva",
    code: "T-103",
    bags: 5,
    image: require("../../../assets/images/propic.jpg"),
    phone: "0758765432",
    fertilizer: 1,
    fertilizerType: "urea",
    address: "12, Main Street, Matara",
  },
  {
    id: 4,
    name: "Nirosha Fernando",
    code: "T-104",
    bags: 8,
    image: require("../../../assets/images/propic.jpg"),
    phone: "0723344556",
    fertilizer: 2,
    fertilizerType: "urea",
    address: "90, Beach Road, Negombo",
  },
  {
    id: 5,
    name: "Ruwan Jayasinghe",
    code: "T-105",
    bags: 6,
    image: require("../../../assets/images/propic.jpg"),
    phone: "0769988776",
    fertilizer: 2,
    fertilizerType: "urea",
    address: "15, Hill Top, Badulla",
  },
  {
    id: 6,
    name: "Kumudu Ranatunga",
    code: "T-106",
    bags: 9,
    image: require("../../../assets/images/propic.jpg"),
    phone: "0781122334",
    fertilizer: 3,
    fertilizerType: "urea",
    address: "7, Station Road, Kurunegala",
  },
];

export default function SupplierHome() {
  const [FACTORY_MAP_URL, setFactoryMapUrl] = useState("");
  const [factoryArrived, setFactoryArrived] = useState(false);

  // Load factoryArrived state and factoryMapUrl from AsyncStorage
  useEffect(() => {
    (async () => {
      const val = await AsyncStorage.getItem("factoryArrived");
      setFactoryArrived(val === "true");
      // Load factoryMapUrl from driverData if available
      const driverDataStr = await AsyncStorage.getItem("driverData");
      if (driverDataStr) {
        try {
          const driverData = JSON.parse(driverDataStr);
          if (driverData.factoryMapUrl) {
            // If it's a lat,lng string, build the Google Maps URL
            const coords = driverData.factoryMapUrl;
            setFactoryMapUrl(
              `https://www.google.com/maps/search/?api=1&query=${coords}`
            );
          }
        } catch {}
      }
    })();
  }, []);

  // When app comes to foreground, check if factoryArrived should be updated
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === "active") {
        const val = await AsyncStorage.getItem("factoryArrived");
        if (val === "false") {
          setFactoryArrived(true);
          await AsyncStorage.setItem("factoryArrived", "true");
        }
      }
    };
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => {
      subscription.remove();
    };
  }, []);
  const [userName, setUserName] = useState("");
  const [isAfterFour, setIsAfterFour] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [pageState, setPageState] = useState("main");
  const [notCollectingReason, setNotCollectingReason] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editReasonModalVisible, setEditReasonModalVisible] = useState(false);
  const [editNotCollectingModalVisible, setEditNotCollectingModalVisible] =
    useState(false);
  const [driverAvailabilityId, setDriverAvailabilityId] = useState(null);
  const [customReason, setCustomReason] = useState("");
  const [todayRequests, setTodayRequests] = useState([]);
  const [todayRequestsModalVisible, setTodayRequestsModalVisible] =
    useState(false);
  const [supplierModalVisible, setSupplierModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [driverId, setDriverId] = useState(null);
  const [isCheckedInToday, setIsCheckedInToday] = useState(null);
  const [todayTripId, setTodayTripId] = useState(null);
  const [todayTripStatus, setTodayTripStatus] = useState(null);
  const [tripBagSummaryModalVisible, setTripBagSummaryModalVisible] =
    useState(false);
  const [tripBagSummary, setTripBagSummary] = useState([]);

  // Check local time for 4:00 PM and update isAfterFour
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      if (now.getHours() >= 1) {
        setIsAfterFour(true);
      } else {
        setIsAfterFour(false);
      }
    };
    checkTime();
    const timer = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [router]);

  const loadUserAndCheckIn = React.useCallback(async () => {
    try {
      // Load user name
      const userDataStr = await AsyncStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setUserName(userData.name || "");
      }
      // Load driverId
      const driverDataStr = await AsyncStorage.getItem("driverData");
      let _driverId = null;
      if (driverDataStr) {
        const driverData = JSON.parse(driverDataStr);
        _driverId = driverData.id || driverData.driverId;
        setDriverId(_driverId);
      }
      console.log("Driver ID:", _driverId);

  // no paymentCollected flag to read

      // Check today's trip
      if (_driverId) {
        try {
          const todayTripRes = await getTodayTrip(_driverId);
          if (todayTripRes && todayTripRes.tripId) {
            setTodayTripId(todayTripRes.tripId);
            setTodayTripStatus(todayTripRes.status);
            await AsyncStorage.setItem(
              "tripId",
              todayTripRes.tripId.toString()
            );
            // Only go to trip if status is pending
            if (todayTripRes.status === "pending") {
              router.push("/(role)/(driver)/(nontabs)/trip");
            }
          } else {
            setTodayTripId(null);
            setTodayTripStatus(null);
          }
        } catch {
          setTodayTripId(null);
          setTodayTripStatus(null);
        }
      }
      // Check today's driver-availability row
      if (_driverId) {
        try {
          const res = await getTodayDriverAvailability(_driverId);
          if (!res || Object.keys(res).length === 0) {
            // No row for today: show check-in button
            setIsCheckedInToday(false);
            setPageState("main");
            setDriverAvailabilityId(null);
          } else if (res.isAvailable) {
            // Checked in: show checked-in card
            setIsCheckedInToday(true);
            setPageState("checkedIn");
            setDriverAvailabilityId(res.id);
          } else {
            // Not collecting: show not-collecting card with reason
            setIsCheckedInToday(false);
            setNotCollectingReason(res.reason || "");
            setPageState("notCollectingSet");
            setDriverAvailabilityId(res.id);
          }
        } catch {
          setIsCheckedInToday(false);
          setPageState("main");
        }
      } else {
        setIsCheckedInToday(false);
        setPageState("main");
      }
    } catch {
      setUserName("");
      setIsCheckedInToday(false);
      setPageState("main");
    }
  }, [router]);

  const fetchTodaySuppliers = React.useCallback(async () => {
    if (isCheckedInToday === true && driverId) {
      try {
        const res = await getTodayTeaSupplyRequests(driverId);
        setTodayRequests(res.requests || []);
      } catch (_error) {
        setTodayRequests([]);
      }
    }
  }, [isCheckedInToday, driverId]);

  const refreshData = React.useCallback(async () => {
    await loadUserAndCheckIn();
    await fetchTodaySuppliers();
  }, [loadUserAndCheckIn, fetchTodaySuppliers]);

  const { refreshing, onRefresh } = usePullToRefresh(refreshData);

  useFocusEffect(
    React.useCallback(() => {
      loadUserAndCheckIn();
    }, [loadUserAndCheckIn])
  );

  // Fetch today's suppliers when checked in
  useEffect(() => {
    fetchTodaySuppliers();
  }, [fetchTodaySuppliers]);

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const router = useRouter();

  const handleCheckIn = () => setModalVisible(true);

  // Removed handleSimulateAfterFour and setAfterFour, no longer needed
  const handleYesCollecting = async () => {
    setModalVisible(false);
    try {
      const _driverId = driverId;
      if (_driverId) {
        // POST to create availability
        const res = await createDriverAvailability(_driverId, true);
        // Try to get the id from response, otherwise fetch today's row
        let newId = res && res.id;
        if (!newId) {
          // Fetch today's row to get id
          const getRes = await getTodayDriverAvailability(_driverId);
          newId = getRes && getRes.id;
        }
        setDriverAvailabilityId(newId || null);
        setIsCheckedInToday(true);
        setPageState("checkedIn");
      } else {
        console.warn("Driver ID not found in storage");
      }
    } catch (_error) {
      console.error("Error posting driver availability:", _error);
    }
  };
  const handleNoCollecting = () => {
    setModalVisible(false);
    setTimeout(() => setPickerModalVisible(true), 200);
  };
  const handleSubmitReason = async () => {
    setPickerModalVisible(false);
    try {
      const _driverId = driverId;
      let newId = null;
      if (_driverId) {
        const res = await createDriverAvailability(
          _driverId,
          false,
          customReason
        );
        newId = res && res.id;
        if (!newId) {
          // Fetch today's row to get id
          const getRes = await getTodayDriverAvailability(_driverId);
          newId = getRes && getRes.id;
        }
        setDriverAvailabilityId(newId || null);
        setNotCollectingReason(customReason);
        setPageState("notCollectingSet");
      } else {
        console.warn("Driver ID not found in storage");
      }
    } catch (_error) {
      console.error("Error posting driver not available:", _error);
    }
    setCustomReason("");
  };
  // When checked in, tap to edit: show 'Are you not collecting today?' modal
  const handleEditCheckedIn = () => setEditModalVisible(true);

  // In edit modal: Yes = show reason modal, Cancel = return to checked-in
  const handleEditNoCollecting = () => {
    setEditModalVisible(false);
    setTimeout(() => setEditReasonModalVisible(true), 200);
  };
  const handleEditCancel = () => {
    setEditModalVisible(false);
    setPageState("checkedIn");
  };

  // Submit edit reason: update today's availability row
  const handleEditSubmitReason = async () => {
    setEditReasonModalVisible(false);
    try {
      if (driverAvailabilityId) {
        const res = await updateDriverAvailability(
          driverAvailabilityId,
          false,
          customReason
        );
        // Update state with new values from backend response if available
        if (res) {
          setNotCollectingReason(res.reason || customReason);
          setDriverAvailabilityId(res.id || driverAvailabilityId);
        } else {
          setNotCollectingReason(customReason);
        }
        setPageState("notCollectingSet");
        setIsCheckedInToday(false);
      } else {
        console.warn("No driverAvailabilityId for update");
      }
    } catch (_error) {
      console.error("Error updating driver availability:", _error);
    }
    setCustomReason("");
  };
  // Tap to edit on not-collecting card: show 'Are you collecting today?' modal
  const handleEditNotCollecting = () => setEditNotCollectingModalVisible(true);

  // In edit not-collecting modal: Yes = set available, Cancel = close modal
  const handleEditNotCollectingYes = async () => {
    setEditNotCollectingModalVisible(false);
    try {
      if (driverAvailabilityId) {
        await updateDriverAvailability(driverAvailabilityId, true, null);
        setIsCheckedInToday(true);
        setPageState("checkedIn");
        setNotCollectingReason("");
      } else {
        console.warn("No driverAvailabilityId for update");
      }
    } catch (_error) {
      console.error("Error updating driver availability:", _error);
    }
  };
  const handleEditNotCollectingCancel = () => {
    setEditNotCollectingModalVisible(false);
    setPageState("notCollectingSet");
  };
  const handlePickerModalClose = () => {
    setPickerModalVisible(false);
    setPageState("main"); // Go back to Check In button
  };
  // const handleShowSuppliers = () => setSupplierModalVisible(true); // No longer needed
  const handleSelectSupplier = (supplier) => setSelectedSupplier(supplier);
  const handleBackToList = () => setSelectedSupplier(null);

  console.log("todayTripStatus", todayTripStatus);
  console.log("todayTripId", todayTripId);

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f8f4" }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero with overlayed greeting */}
        <View style={styles.heroCard}>
          <ImageBackground
            source={require("../../../assets/images/hero.jpg")}
            style={styles.heroImg}
            imageStyle={{ borderRadius: 16 }}
          >
            <Text style={styles.hello}>
              Hi {userName ? userName : "Driver"}!
            </Text>
          </ImageBackground>
        </View>
        {/* Collect your Cash Card - tap to open Wallet collection popup */}
        <TouchableOpacity
          style={styles.cashCard}
          onPress={() => router.push('/(role)/(driver)/wallet?openCollect=true')}
          activeOpacity={0.85}
        >
          <View>
            <Text style={styles.cashCardLabel}>Collect your Cash</Text>
            <Text style={styles.cashCardDate}>Date : 25/06/25</Text>
          </View>
          <Text style={styles.cashCardValue}>Rs 50,000.00</Text>
        </TouchableOpacity>
        {/* This month's Supply Card (navigates to income) */}
        <TouchableOpacity
          style={styles.supplyCard}
          activeOpacity={0.85}
          onPress={() => router.push('/(role)/(driver)/(nontabs)/income')}
        >
          <Text style={styles.supplyCardLabel}>This month’s Supply</Text>
          <Text style={styles.supplyCardDate}>As at : 25/06/25</Text>
          <Text style={styles.supplyCardValue}>
            1000.5 <Text style={styles.supplyCardUnit}>kg</Text>
          </Text>
        </TouchableOpacity>
        {/* Wallet Card - tap to open Wallet page */}
        <TouchableOpacity
          style={styles.supplyCard}
          onPress={() => router.push('/(role)/(driver)/wallet')}
          activeOpacity={0.85}
        >
          <Text style={styles.supplyCardLabel}>Wallet</Text>
          <Text style={styles.walletCardValue}>
            Rs <Text style={styles.walletCardValueNum}>50,000.00</Text>
          </Text>
        </TouchableOpacity>

        {/* Check In Button or Checked In Card based on today's status */}
        {isCheckedInToday === null && (
          <View style={{ alignItems: "center", marginTop: 30 }}>
            <Text style={{ color: "#888", fontSize: 18 }}>
              Loading status...
            </Text>
          </View>
        )}
        {isCheckedInToday === false && pageState === "main" && (
          <TouchableOpacity style={styles.checkInBtn} onPress={handleCheckIn}>
            <Text style={styles.checkInText}>Check In</Text>
          </TouchableOpacity>
        )}

        {/* If trip exists and status is collected , show All Trips Completed below wallet */}
        {todayTripId &&
          (todayTripStatus === "collected" ||
            todayTripStatus === "arrived") && (
            <View style={styles.checkedInCard}>
              <Text style={styles.checkedInTitle}>All Trips Completed</Text>
              <TouchableOpacity
                onPress={async () => {
                  // Fetch trip bag summary for this trip
                  try {
                    const res = await getTripBagSummaryByTrip(todayTripId);
                    setTripBagSummary(res || []);
                  } catch {
                    setTripBagSummary([]);
                  }
                  setTripBagSummaryModalVisible(true);
                }}
              >
                <Text style={styles.supplierCountHint}>
                  Tap to view details
                </Text>
              </TouchableOpacity>
              {/* Go to Factory / Arrived button */}
              {todayTripStatus === "collected" && (
                <>
                  <TouchableOpacity
                    style={{
                      marginTop: 18,
                      backgroundColor: "#183d2b",
                      paddingVertical: 14,
                      paddingHorizontal: 40,
                      borderRadius: 24,
                      alignSelf: "center",
                      elevation: 2,
                    }}
                    onPress={async () => {
                      if (!factoryArrived) {
                        // Open map to factory
                        try {
                          Linking.openURL(FACTORY_MAP_URL);
                          await AsyncStorage.setItem("factoryArrived", "false");
                        } catch (_err) {
                          Alert.alert("Error", "Could not open map.");
                        }
                      } else {
                        // Mark as arrived and update trip status
                        try {
                          if (todayTripId) {
                            await updateTripStatus(todayTripId, "arrived");
                          }
                        } catch (_err) {
                          Alert.alert(
                            "Error",
                            "Failed to update trip status to arrived."
                          );
                        }
                        await AsyncStorage.setItem("factoryArrived", "true");
                        setFactoryArrived(true);
                        setTodayTripStatus("arrived");
                        Alert.alert("Arrived at Factory");
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
                      {factoryArrived ? "Arrived" : "Go to Factory"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        {/* Trip Bag Summary Modal for All Trips Completed */}
        <Modal
          visible={tripBagSummaryModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setTripBagSummaryModalVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(0,0,0,0.22)",
            }}
            onPress={() => setTripBagSummaryModalVisible(false)}
          >
            <Pressable
              style={{
                backgroundColor: "#fff",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingHorizontal: 24,
                paddingTop: 18,
                paddingBottom: 12,
                alignItems: "center",
                height: "50%",
                maxHeight: "50%",
                width: "100%",
              }}
              onPress={(e) => e.stopPropagation()}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  marginBottom: 12,
                }}
              >
                Trips Summary
              </Text>
              <ScrollView
                style={{ width: "100%" }}
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                {tripBagSummary.length === 0 && (
                  <Text
                    style={{
                      color: "#888",
                      fontSize: 16,
                      textAlign: "center",
                    }}
                  >
                    No summary found.
                  </Text>
                )}
                {tripBagSummary.map((summary) => {
                  // Try to find supplier name from todayRequests or suppliers
                  let supplierName = "Supplier";
                  let supplierImage = require("../../../assets/images/propic.jpg");
                  // Correct matching: todayRequests.requestId === summary.supplyRequestId
                  let req = todayRequests.find(
                    (r) => r.requestId === summary.supplyRequestId
                  );
                  if (req) {
                    supplierName = req.supplierName;
                    if (req.image) supplierImage = { uri: req.image };
                  } else {
                    // fallback: try to match by id in suppliers array
                    let s = suppliers.find(
                      (sup) => sup.id === summary.supplyRequestId
                    );
                    if (s) {
                      supplierName = s.name;
                      supplierImage = s.image;
                    }
                  }
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
                        source={supplierImage}
                        style={styles.supplierAvatar}
                      />
                      <View>
                        <Text style={styles.listSupplierName}>
                          {supplierName}
                        </Text>
                        <Text style={styles.listSupplierBags}>
                          {summary.totalBags} Bags - {summary.totalWeight} kg
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        {/* If trip does not exist or is pending, show normal checked-in UI */}
        {(!todayTripId || todayTripStatus === "pending") &&
          isCheckedInToday === true &&
          pageState === "checkedIn" && (
            <>
              {/* Simulate After 4.00 PM or Simulate Ready text */}
              <View
                style={{ marginHorizontal: 18, marginTop: 0, marginBottom: 10 }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: "#165E52",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {isAfterFour ? "Simulate Ready" : "Simulate After 4.00 PM"}
                </Text>
              </View>
              {/* Checked-in card only before 4pm */}
              {!isAfterFour && (
                <View>
                  <TouchableOpacity
                    style={styles.checkedInCard}
                    onPress={handleEditCheckedIn}
                  >
                    <Text style={styles.checkedInTitle}>Checked In</Text>
                    <Text style={styles.editHint}>Tap to edit</Text>
                  </TouchableOpacity>
                </View>
              )}
              {/* Show Today's Total Suppliers below checked in card */}
              <View style={styles.supplierCountCard}>
                <Text style={styles.supplierCountTitle}>
                  Today&apos;s Total Suppliers
                </Text>
                <Text style={styles.supplierCountNum}>
                  {todayRequests.length}{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => setTodayRequestsModalVisible(true)}
                >
                  <Text style={styles.supplierCountHint}>
                    Tap to view details
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Start Trip button only after 4pm and if there are requests for today */}
              {isAfterFour && todayRequests.length > 0 && (
                <TouchableOpacity
                  style={[styles.startTripBtn, { marginBottom: 40 }]}
                  onPress={async () => {
                    // Get driverId and routeId from stored driverData
                    const driverDataStr =
                      await AsyncStorage.getItem("driverData");
                    let driverId = null;
                    let routeId = null;
                    if (driverDataStr) {
                      const driverData = JSON.parse(driverDataStr);
                      driverId = driverData.driverId || driverData.id;
                      routeId = driverData.routeId;
                    }
                    if (!driverId || !routeId) {
                      Alert.alert("Error", "Driver or route not found.");
                      return;
                    }
                    if (todayTripId) {
                      // Trip already exists, go to trip screen
                      router.push("/(role)/(driver)/(nontabs)/trip");
                      return;
                    }
                    // Confirm before creating new trip
                    Alert.alert(
                      "Start Trip",
                      "Are you sure you want to start the trip?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Start",
                          style: "default",
                          onPress: async () => {
                            try {
                              const tripRes = await createTrip(
                                driverId,
                                routeId
                              );
                              if (tripRes && tripRes.tripId) {
                                await AsyncStorage.setItem(
                                  "tripId",
                                  tripRes.tripId.toString()
                                );
                                setTodayTripId(tripRes.tripId);
                                setTodayTripStatus("pending");
                              }
                            } catch (_error) {
                              Alert.alert(
                                "Error",
                                "Failed to start trip. Please try again."
                              );
                              return;
                            }
                            router.push("/(role)/(driver)/(nontabs)/trip");
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Text style={styles.startTripBtnText}>Start Trip</Text>
                </TouchableOpacity>
              )}
              {/* ...existing code for modals... */}
              {/* Edit Modal: Are you not collecting today? */}
              <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
              >
                <Pressable
                  style={styles.modalOverlay}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Pressable
                    style={styles.modalContent}
                    onPress={(e) => e.stopPropagation()}
                  >
                    <Text style={styles.modalTitle}>
                      Are you not collecting today?
                    </Text>
                    <View style={styles.modalBtnRow}>
                      <TouchableOpacity
                        style={styles.modalBtnNo}
                        onPress={handleEditCancel}
                      >
                        <Text style={styles.modalBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.modalBtnYes}
                        onPress={handleEditNoCollecting}
                      >
                        <Text style={styles.modalBtnText}>Yes</Text>
                      </TouchableOpacity>
                    </View>
                  </Pressable>
                </Pressable>
              </Modal>
              {/* Edit Reason Modal */}
              <Modal
                visible={editReasonModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditReasonModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                      Why are you not collecting today?
                    </Text>
                    <TextInput
                      style={[
                        styles.picker,
                        { fontSize: 20, color: "#183d2b", padding: 10 },
                      ]}
                      placeholder="Enter your reason..."
                      placeholderTextColor="#888"
                      value={customReason}
                      onChangeText={setCustomReason}
                      multiline
                      numberOfLines={2}
                    />
                    <View style={styles.modalBtnRow}>
                      <TouchableOpacity
                        style={styles.modalBtnNo}
                        onPress={() => setEditReasonModalVisible(false)}
                      >
                        <Text style={styles.modalBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.modalBtnYes,
                          !customReason.trim() && { opacity: 0.5 },
                        ]}
                        disabled={!customReason.trim()}
                        onPress={handleEditSubmitReason}
                      >
                        <Text style={styles.modalBtnText}>Submit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
              {/* Modal for today's supplier requests - half screen, scrollable, dismiss on overlay press */}
              <Modal
                visible={todayRequestsModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setTodayRequestsModalVisible(false)}
              >
                <Pressable
                  style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    backgroundColor: "rgba(0,0,0,0.22)",
                  }}
                  onPress={() => setTodayRequestsModalVisible(false)}
                >
                  <Pressable
                    style={{
                      backgroundColor: "#fff",
                      borderTopLeftRadius: 24,
                      borderTopRightRadius: 24,
                      paddingHorizontal: 24,
                      paddingTop: 18,
                      paddingBottom: 12,
                      alignItems: "center",
                      height: "50%",
                      maxHeight: "50%",
                      width: "100%",
                    }}
                    onPress={(e) => e.stopPropagation()}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        marginBottom: 12,
                      }}
                    >
                      Today&apos;s Suppliers
                    </Text>
                    <ScrollView
                      style={{ width: "100%" }}
                      contentContainerStyle={{ paddingBottom: 16 }}
                    >
                      {todayRequests.length === 0 && (
                        <Text
                          style={{
                            color: "#888",
                            fontSize: 16,
                            textAlign: "center",
                          }}
                        >
                          No suppliers found.
                        </Text>
                      )}
                      {todayRequests.map((req) => (
                        <View
                          key={req.requestId}
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
                            source={
                              req.image
                                ? { uri: req.image }
                                : require("../../../assets/images/propic.jpg")
                            }
                            style={styles.supplierAvatar}
                          />
                          <View>
                            <Text style={styles.listSupplierName}>
                              {req.supplierName}
                            </Text>
                            <Text style={styles.listSupplierBags}>
                              {req.estimatedBagCount} Bags
                            </Text>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </Pressable>
                </Pressable>
              </Modal>
            </>
          )}

        {/* Not Collecting Card */}
        {pageState === "notCollectingSet" && (
          <>
            <TouchableOpacity
              style={styles.notCollectingCard}
              onPress={handleEditNotCollecting}
            >
              <Text style={styles.notCollectingTitle}>
                I&apos;m not collecting today
              </Text>
              <Text style={styles.notCollectingReason}>
                Reason: {notCollectingReason}
              </Text>
              <Text style={styles.editHint}>Tap to edit</Text>
            </TouchableOpacity>
            {/* Edit Not-Collecting Modal: Are you collecting today? */}
            <Modal
              visible={editNotCollectingModalVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setEditNotCollectingModalVisible(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setEditNotCollectingModalVisible(false)}
              >
                <Pressable
                  style={styles.modalContent}
                  onPress={(e) => e.stopPropagation()}
                >
                  <Text style={styles.modalTitle}>
                    Are you collecting today?
                  </Text>
                  <View style={styles.modalBtnRow}>
                    <TouchableOpacity
                      style={styles.modalBtnNo}
                      onPress={handleEditNotCollectingCancel}
                    >
                      <Text style={styles.modalBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalBtnYes}
                      onPress={handleEditNotCollectingYes}
                    >
                      <Text style={styles.modalBtnText}>Yes</Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          </>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Are you collecting today?</Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalBtnNo}
                onPress={handleNoCollecting}
              >
                <Text style={styles.modalBtnText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnYes}
                onPress={handleYesCollecting}
              >
                <Text style={styles.modalBtnText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      {/* Picker Modal: Reason for not collecting */}
      <Modal
        visible={pickerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handlePickerModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Why are you not collecting today?
            </Text>
            <TextInput
              style={[
                styles.picker,
                { fontSize: 20, color: "#183d2b", padding: 10 },
              ]}
              placeholder="Enter your reason..."
              placeholderTextColor="#888"
              value={customReason}
              onChangeText={setCustomReason}
              multiline
              numberOfLines={2}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalBtnNo}
                onPress={handlePickerModalClose}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtnYes,
                  !customReason.trim() && { opacity: 0.5 },
                ]}
                disabled={!customReason.trim()}
                onPress={handleSubmitReason}
              >
                <Text style={styles.modalBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Supplier List Modal (with map and search) */}
      <Modal
        visible={supplierModalVisible && !selectedSupplier}
        transparent
        animationType="slide"
        onRequestClose={() => setSupplierModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentList}>
            {/* Map Image */}
            <Image
              source={require("../../../assets/images/map.jpg")}
              style={styles.mapImage}
              resizeMode="cover"
            />
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#888"
                style={{ marginLeft: 12 }}
              />
              <TextInput
                style={styles.searchBar}
                placeholder="Search supplier"
                placeholderTextColor="#888"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
            {/* Supplier List */}
            <ScrollView style={{ width: "100%" }}>
              {filteredSuppliers.map((supplier) => (
                <TouchableOpacity
                  key={supplier.id}
                  style={styles.supplierRow}
                  onPress={() => handleSelectSupplier(supplier)}
                >
                  <Image
                    source={supplier.image}
                    style={styles.supplierAvatar}
                  />
                  <Text style={styles.supplierName}>{supplier.name}</Text>
                  <Text style={styles.supplierBags}>{supplier.bags} Bags</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalBtnNo}
              onPress={() => setSupplierModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Supplier Detail Modal with curved green background */}
      <Modal
        visible={!!selectedSupplier}
        transparent
        animationType="slide"
        onRequestClose={handleBackToList}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.profileModalContent}>
            {/* Curved Green Header */}
            <View style={styles.profileHeader}>
              <Image
                source={selectedSupplier?.image}
                style={styles.profileAvatar}
              />
              <View style={styles.profileHeaderInfo}>
                <Text style={styles.profileCode}>{selectedSupplier?.code}</Text>
                <Text style={styles.profileName}>{selectedSupplier?.name}</Text>
                <TouchableOpacity style={styles.profileBtn}>
                  <Text style={styles.profileBtnText}>View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Details Card */}
            <View style={styles.profileDetailsCard}>
              <View style={styles.profileInfoRow}>
                <View style={styles.profileInfoBlock}>
                  <Text style={styles.profileInfoLabel}>Supply</Text>
                  <Text style={styles.profileInfoValue}>
                    {selectedSupplier?.bags}{" "}
                    <Text style={styles.profileInfoUnit}>Bags</Text>
                  </Text>
                </View>
                <View style={styles.profileInfoBlock}>
                  <Text style={styles.profileInfoLabel}>Fertilizers</Text>
                  <Text style={styles.profileInfoValue}>
                    {selectedSupplier?.fertilizer?.toString().padStart(2, "0")}{" "}
                    <Text style={styles.profileInfoUnit}>
                      {selectedSupplier?.fertilizerType}
                    </Text>
                  </Text>
                </View>
              </View>
              <View style={styles.profileAddressRow}>
                <Ionicons
                  name="location-sharp"
                  size={20}
                  color="#183d2b"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.profileAddressText}>
                  {selectedSupplier?.address}
                </Text>
              </View>
              <View style={styles.profileBtnRow}>
                <TouchableOpacity
                  style={styles.modalBtnNo}
                  onPress={handleBackToList}
                >
                  <Text style={styles.modalBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalBtnYes}
                  onPress={() =>
                    Linking.openURL(`tel:${selectedSupplier?.phone}`)
                  }
                >
                  <Text style={styles.modalBtnText}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f8f4" },
  heroCard: {
    marginHorizontal: 5,
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#eaf2ea",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  heroImg: {
    width: "100%",
    height: 150,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  hello: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginTop: 20,
    marginLeft: 20,
    textShadowColor: "#0006",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  cashCard: {
    marginHorizontal: 12,
    marginTop: 2,
    marginBottom: 10,
    backgroundColor: "#590804",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    borderWidth: 2,
    borderColor: "#4e4e4e10",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    height: 100,
  },
  cashCardLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  cashCardDate: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.85,
    marginTop: 25,
  },
  cashCardValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 16,
  },
  supplyCard: {
    marginHorizontal: 18,
    marginTop: 0,
    backgroundColor: "#eaf2ea",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#b0c2b0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  supplyCardLabel: {
    color: "#222",
    fontSize: 25,
    fontWeight: "400",
    marginBottom: 1,
  },
  supplyCardDate: {
    color: "#222",
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 3,
  },
  supplyCardValue: {
    color: "#000",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 2,
    marginLeft: 160,
  },
  supplyCardUnit: {
    fontSize: 16,
    color: "#888",
    fontWeight: "400",
  },
  walletCardValue: {
    color: "#183d2b",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 1,
    marginLeft: 85,
  },
  walletCardValueNum: {
    color: "#165E52",
    fontSize: 30,
    fontWeight: "700",
  },
  checkInBtn: {
    backgroundColor: "#183d2b",
    borderRadius: 40,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 80,
    marginTop: 20,
    marginBottom: 8,
    elevation: 2,
  },
  checkInText: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "400",
    letterSpacing: 1,
  },
  checkedInCard: {
    backgroundColor: "#eaf2ea",
    marginTop: 12,
    marginBottom: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    alignItems: "center",
  },
  checkedInTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#183d2b",
    marginBottom: 8,
  },
  notCollectingCard: {
    backgroundColor: "#eaf2ea",
    marginTop: 12,
    marginBottom: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  notCollectingTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#183d2b",
    marginBottom: 8,
  },
  notCollectingReason: {
    fontSize: 17,
    color: "#222",
    marginBottom: 4,
  },
  editHint: {
    fontSize: 13,
    color: "#888",
  },
  simBtnText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1,
    textAlign: "center",
    backgroundColor: "#eaf2ea",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 10,
    marginBottom: 10,
    overflow: "hidden",
  },
  supplierCountCard: {
    backgroundColor: "#eaf2ea",
    marginHorizontal: 18,
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    alignItems: "center",
    elevation: 1,
    borderWidth: 1,
    borderColor: "#b0c2b0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  supplierCountTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#183d2b",
    marginBottom: 8,
  },
  supplierCountNum: {
    fontSize: 38,
    fontWeight: "700",
    color: "#183d2b",
  },
  supplierCountUnit: {
    fontSize: 38,
    color: "#888",
    fontWeight: "400",
  },
  supplierCountHint: {
    fontSize: 13,
    color: "#888",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.22)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  modalContentList: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: "center",
    maxHeight: "50%", // Half screen
    height: "50%", // Half screen
  },
  mapImage: {
    width: "100%",
    height: 120,
    borderRadius: 14,
    marginBottom: 12,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f8f4",
    borderRadius: 18,
    marginBottom: 10,
    marginHorizontal: 2,
    paddingVertical: 6,
    width: "100%",
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: "#183d2b",
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
  },
  supplierRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eaf2ea",
    width: "100%",
  },
  supplierAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
    backgroundColor: "#eee",
  },
  supplierName: {
    fontSize: 17,
    color: "#183d2b",
    flex: 1,
    fontWeight: "500",
  },
  supplierBags: {
    fontSize: 15,
    color: "#222",
    fontWeight: "400",
    marginLeft: 10,
  },
  // Curved profile modal
  profileModalContent: {
    width: "100%",
    alignItems: "center",
    padding: 0,
    backgroundColor: "#fff",
  },
  profileHeader: {
    width: "100%",
    backgroundColor: "#183d2b",
    paddingTop: 32,
    paddingBottom: 28,
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 12,
  },
  profileAvatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#fff",
    marginLeft: 15,
    marginTop: 12,
    backgroundColor: "#eee",
  },
  profileHeaderInfo: {
    marginLeft: 24,
    marginTop: 4,
    flex: 1,
  },
  profileCode: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    opacity: 0.85,
    marginBottom: 2,
  },
  profileName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  profileBtn: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 5,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  profileBtnText: {
    color: "#183d2b",
    fontWeight: "600",
    fontSize: 15,
  },
  profileDetailsCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    marginTop: -18,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    alignItems: "center",
    // justifyContent:'center',
  },
  profileInfoRow: {
    flexDirection: "row", // Horizontal row
    alignItems: "center",
    justifyContent: "center", // Center the row
    width: "100%",
    marginBottom: 14,
  },
  profileInfoBlock: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  profileInfoLabel: {
    color: "#222",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  profileInfoValue: {
    color: "#183d2b",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 2,
    textAlign: "center",
  },
  profileInfoUnit: {
    fontSize: 15,
    color: "#888",
    fontWeight: "400",
    textAlign: "center",
  },
  profileAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    marginTop: 2,
    width: "100%",
  },
  profileAddressText: {
    fontSize: 16,
    color: "#183d2b",
    fontWeight: "500",
    flexWrap: "wrap",
    textAlign: "center",
  },
  profileBtnRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    width: "100%",
  },

  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 8,
    gap: 16, // If your React Native version supports it; otherwise use margin on children
  },
  modalBtnYes: {
    backgroundColor: "#183d2b",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flex: 1,
    marginLeft: 0,
    marginRight: 0,
    minWidth: 0,
  },
  modalBtnNo: {
    backgroundColor: "#a11a1a",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flex: 1,
    marginLeft: 0,
    marginRight: 0,
    minWidth: 0,
  },
  modalBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  picker: {
    width: "100%",
    backgroundColor: "#eaf2ea",
    borderRadius: 12,
    marginTop: 8,
  },

  simulateReadyBtn: {
    backgroundColor: "#165E52",
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 18,
    alignItems: "center",
  },
  simulateReadyBtnText: {
    color: "#000",
    fontSize: 17,
    letterSpacing: 1,
  },
  startTripBtn: {
    backgroundColor: "#183d2b",
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 36,
    marginTop: 16,
    alignItems: "center",
    alignSelf: "center",
  },
  startTripBtnText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
