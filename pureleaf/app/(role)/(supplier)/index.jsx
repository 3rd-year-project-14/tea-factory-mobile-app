import React, { useRef, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import RBSheet from "react-native-raw-bottom-sheet";

import {
  getTeaSupplyRequestsBySupplier,
  createTeaSupplyRequest,
  updateTeaSupplyRequestBagCount,
  deleteTeaSupplyRequest,
} from "../../../services/supplierService";
import { usePullToRefresh } from "../../../hooks/usePullToRefresh";

export default function SupplierHome({ navigation }) {
  const [userName, setUserName] = useState("");
  const sheetRef = useRef();
  const simSheetRef = useRef(); // <-- New ref for simulation sheet
  const router = useRouter();

  const [supplyState, setSupplyState] = useState("none"); // 'none', 'input', 'placed', 'driver', 'factory'

  const [bagCount, setBagCount] = useState("");
  const [lastBagCount, setLastBagCount] = useState(null);
  const [todayRequestId, setTodayRequestId] = useState(null);
  const [todayBagCount, setTodayBagCount] = useState(null);
  const [isLoadingToday, setIsLoadingToday] = useState(true);

  const [simPage, setSimPage] = useState(1);

  const loadUserName = React.useCallback(async () => {
    try {
      const userDataStr = await AsyncStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setUserName(userData.name || "");
      }
    } catch (_error) {
      setUserName("");
    }
  }, []);

  const fetchSupplierRequests = React.useCallback(async () => {
    setIsLoadingToday(true);
    try {
      // Get supplierId from stored supplierData
      const supplierDataStr = await AsyncStorage.getItem("supplierData");
      let supplierId = null;
      if (supplierDataStr) {
        try {
          const supplierData = JSON.parse(supplierDataStr);
          if (Array.isArray(supplierData) && supplierData.length > 0) {
            supplierId = supplierData[0].supplierId;
          } else if (supplierData && supplierData.supplierId) {
            supplierId = supplierData.supplierId;
          }
        } catch (_error) {
          supplierId = null;
        }
      }
      if (!supplierId) {
        setTodayRequestId(null);
        setTodayBagCount(null);
        setSupplyState("none");
        setIsLoadingToday(false);
        return;
      }
      const response = await getTeaSupplyRequestsBySupplier(supplierId);
      const data = response.data;
      // Assume data is an array of requests
      if (Array.isArray(data) && data.length > 0) {
        // Find all requests for today
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10); // 'YYYY-MM-DD'
        const todaysRequests = data.filter((req) => {
          // Match by supplyDate (sample response uses supplyDate)
          return req.supplyDate === todayStr;
        });
        // Use the last request for today (if any)
        const latestRequest =
          todaysRequests.length > 0
            ? todaysRequests[todaysRequests.length - 1]
            : null;
        if (latestRequest && latestRequest.requestId) {
          setTodayRequestId(latestRequest.requestId);
          setRequestId(latestRequest.requestId);
          if (latestRequest.estimatedBagCount !== undefined) {
            setTodayBagCount(latestRequest.estimatedBagCount);
            setLastBagCount(latestRequest.estimatedBagCount);
          }
          setSupplyState("placed");
        } else {
          setTodayRequestId(null);
          setTodayBagCount(null);
          setSupplyState("none");
        }
      } else {
        setTodayRequestId(null);
        setTodayBagCount(null);
        setSupplyState("none");
      }
    } catch {
      setTodayRequestId(null);
      setTodayBagCount(null);
      setSupplyState("none");
    }
    setIsLoadingToday(false);
  }, []);

  const refreshData = React.useCallback(async () => {
    await loadUserName();
    await fetchSupplierRequests();
  }, [loadUserName, fetchSupplierRequests]);

  const { refreshing, onRefresh } = usePullToRefresh(refreshData);

  // Fetch today's supply request for supplier on mount
  useEffect(() => {
    loadUserName();
    fetchSupplierRequests();
  }, [loadUserName, fetchSupplierRequests]);

  // Open the modal for entering supply
  const openSupplyModal = () => {
    setSupplyState("input");
    // If today's request exists, pre-fill bag count
    if (todayBagCount !== null) {
      setBagCount(String(todayBagCount));
      setIsEditing(true);
    } else {
      setBagCount("");
      setIsEditing(false);
    }
    sheetRef.current.open();
  };

  // Backend API response state
  // Removed API feedback message state
  // Store created requestId
  const [requestId, setRequestId] = useState(null);
  // Track if modal is for editing
  const [isEditing, setIsEditing] = useState(false);

  // When editing supply (just open modal and set bag count)
  const handleEdit = () => {
    if (!requestId) {
      return;
    }
    setSupplyState("input");
    setBagCount(lastBagCount || "");
    setIsEditing(true);
    sheetRef.current.open();
  };

  // ...existing code...

  // When confirming supply
  const handleConfirm = async () => {
    sheetRef.current.close();
    // If today's request exists, only allow edit, not create
    if (todayRequestId || (isEditing && requestId)) {
      try {
        await updateTeaSupplyRequestBagCount(requestId, bagCount);
        setLastBagCount(bagCount);
        setTodayBagCount(Number(bagCount));
        setSupplyState("placed");
      } catch (_error) {}
      setIsEditing(false);
      return;
    }
    // Prefer supplierData from AsyncStorage
    let supplierId = null;
    const supplierDataStr = await AsyncStorage.getItem("supplierData");
    if (supplierDataStr) {
      try {
        const supplierData = JSON.parse(supplierDataStr);
        // supplierData could be array or object
        if (Array.isArray(supplierData) && supplierData.length > 0) {
          supplierId = supplierData[0].supplierId;
        } else if (supplierData && supplierData.supplierId) {
          supplierId = supplierData.supplierId;
        }
      } catch (e) {
        console.log("[ERROR] Parsing supplierData:", e);
      }
    }
    if (!supplierId) {
      console.warn(
        "[WARN] No supplierId found in supplierData. Cannot create supply request."
      );
      return;
    }
    const response = await createTeaSupplyRequest(supplierId, bagCount);
    const data = response.data;
    if (data && (data.id || data.requestId || data.request_id)) {
      // Support 'id', 'requestId', and 'request_id' from backend
      const newId = data.id || data.requestId || data.request_id;
      setRequestId(newId); // Store the created request id for future updates
      setTodayRequestId(newId);
    }
    setLastBagCount(bagCount);
    setTodayBagCount(Number(bagCount));
    setSupplyState("placed");
  };

  const handleCancel = async () => {
    // Delete supply request if exists
    if (requestId) {
      try {
        await deleteTeaSupplyRequest(requestId);
        setTodayRequestId(null);
        setTodayBagCount(null);
        setRequestId(null);
        setLastBagCount(null);
        setSupplyState("none");
      } catch (_error) {}
    } else {
      setLastBagCount(null);
      setSupplyState("none");
    }
    sheetRef.current?.close();
  };

  // Modal Content
  const renderModalContent = () => {
    if (supplyState === "input") {
      return (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={true}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.sheetContent}>
              <Text style={styles.supplyCardLabel}>Today&apos;s Supply :</Text>
              <Text style={styles.supplyCardDate1}>Enter your Bag count</Text>
              <TextInput
                style={styles.sheetInput}
                placeholder="eg: 10"
                keyboardType="number-pad"
                value={bagCount}
                onChangeText={setBagCount}
                placeholderTextColor="#888"
              />
              <TouchableOpacity
                style={[
                  styles.sheetBtn,
                  { backgroundColor: bagCount ? "#183d2b" : "#bbb" },
                ]}
                disabled={!bagCount}
                onPress={handleConfirm}
              >
                <Text style={styles.sheetBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      );
    }
    if (supplyState === "placed") {
      return (
        <View style={styles.sheetContent}>
          <Text style={styles.reqCardLabel}>Today&apos;s Supply :</Text>
          <Text style={styles.reqCardDate}>Request Placed</Text>
          <Text style={styles.sheetTitle}>
            {lastBagCount} <Text style={styles.supplyUnit}>bags</Text>
          </Text>
          <View style={{ flexDirection: "row", marginTop: 16 }}>
            <TouchableOpacity
              style={[
                styles.sheetBtn,
                {
                  backgroundColor: requestId ? "#183d2b" : "#bbb",
                  marginRight: 10,
                },
              ]}
              onPress={handleEdit}
              disabled={!requestId}
            >
              <Text style={styles.sheetBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sheetBtn, { backgroundColor: "#590804" }]}
              onPress={handleCancel}
            >
              <Text style={styles.sheetBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          {/* <TouchableOpacity
            style={[
              styles.sheetBtn,
              { backgroundColor: "#fff", marginTop: 18 },
            ]}
            onPress={() => {
              setSupplyState("driver");
              sheetRef.current.close();
            }}
          >
            <Text style={styles.sheetBtnText1}>Simulate Driver On The Way</Text>
          </TouchableOpacity> */}
        </View>
      );
    }
    if (supplyState === "driver") {
      return (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.driverModal}>
            <Text style={styles.reqCardLabel}>Today&apos;s Supply :</Text>
            <Text style={styles.sheetTitle}>
              {lastBagCount} <Text style={styles.supplyUnit}>bags</Text>
            </Text>
            <Text style={styles.driverModalSub}>Get your leaves ready!</Text>
            <View style={styles.driverCard}>
              <Image
                source={require("../../../assets/images/driver.jpg")}
                style={styles.driverImg}
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.driverName}>Saman</Text>
                <Text style={styles.driverStatus}>is on the way</Text>
                <Text style={styles.driverVehicle}>
                  Vehicle : <Text style={{ fontWeight: "bold" }}>LN 2535</Text>
                </Text>
                <Text style={styles.driverModel}>Isuzu NKR66E</Text>
              </View>
            </View>
            <Text style={styles.pickupLabel}>
              Pick Up at <Text style={styles.pickupTime}>5:45PM</Text>
            </Text>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sheetBtn,
                { backgroundColor: "#fff", marginTop: 18 },
              ]}
              onPress={() => {
                setSupplyState("factory");
                sheetRef.current?.close();
              }}
            >
              <Text style={styles.sheetBtnText1}>
                Simulate On The Way To Factory
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }
    if (supplyState === "factory") {
      return (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.sheetContent}>
            <Text style={styles.reqCardLabel}>Today&apos;s Supply :</Text>
            <Text style={styles.reqCardDate}>On the way to the factory</Text>
            <Text style={styles.sheetTitle}>
              {lastBagCount} <Text style={styles.supplyUnit}>bags</Text>
            </Text>
            <Text style={styles.reqCardLabel}>Tentative Weight :</Text>
            <Text style={styles.sheetTitle}>
              53.4 <Text style={styles.supplyUnit}>kg</Text>
            </Text>
            <View style={{ flexDirection: "row", marginTop: 16 }}>
              <TouchableOpacity
                style={[
                  styles.sheetBtn,
                  { backgroundColor: "#183d2b", marginRight: 10 },
                ]}
                onPress={handleEdit}
              >
                <Text style={styles.sheetBtnText}>Inquire</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.sheetBtn,
                { backgroundColor: "#fff", marginTop: 18 },
              ]}
              onPress={() => {
                setSupplyState("factoryReached");
                sheetRef.current?.close();
              }}
            >
              <Text style={styles.sheetBtnText1}>Simulate Reached Factory</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }
    if (supplyState === "factoryReached") {
      return (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.driverModal}>
            <Text style={styles.reqCardLabel}>Today&apos;s Supply :</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={styles.sheetTitle}>52.9</Text>
              <Text style={[styles.supplyUnit, { fontSize: 17 }]}>kg</Text>
            </View>
            <Text style={{ color: "red", fontSize: 16, marginBottom: 8 }}>
              difference -0.5 kg
            </Text>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 16,
                alignSelf: "flex-start",
                marginBottom: 2,
              }}
            >
              Reason :
            </Text>
            <Text
              style={{
                fontSize: 16,
                alignSelf: "flex-start",
                marginBottom: 16,
              }}
            >
              Water weight reduced by 0.5kg
            </Text>
            <TouchableOpacity
              style={[
                styles.sheetBtn,
                { backgroundColor: "#183d2b", width: 160, marginTop: 12 },
              ]}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                Inquire
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }
    return null;
  };

  // Show the "Request Placed" card when supply is placed

  const showRequestPlacedCard =
    ["placed", "driver", "factory", "factoryReached"].includes(supplyState) &&
    lastBagCount;

  // Simulation Sheet Content
  const renderSimulationSheet = () => (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      {simPage === 1 ? (
        <>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
            This month&apos;s Supply
          </Text>
          <Text style={{ fontSize: 34, fontWeight: "bold", color: "#183d2b" }}>
            1000.5 kg
          </Text>
          <Text style={{ fontSize: 18, marginTop: 20 }}>Wallet</Text>
          <Text style={{ fontSize: 28, color: "#165E52", fontWeight: "bold" }}>
            Rs 50,000.00
          </Text>
          <Text style={{ fontSize: 18, marginTop: 24 }}>
            Today&apos;s Supply:{" "}
            <Text style={{ fontWeight: "bold" }}>53.4 kg</Text>
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#183d2b",
              borderRadius: 30,
              paddingVertical: 14,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 24,
              width: 180,
            }}
            onPress={() => setSimPage(2)}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              Show Bag Details
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
            Today&apos;s Supply
          </Text>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#183d2b" }}>
            {lastBagCount || 11} bags
          </Text>
          <Text style={{ fontSize: 18, marginTop: 10 }}>Tentative Weight:</Text>
          <Text style={{ fontSize: 28, color: "#165E52", fontWeight: "bold" }}>
            53.4 kg
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#183d2b",
              borderRadius: 30,
              paddingVertical: 14,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 24,
              width: 180,
            }}
            onPress={() => setSimPage(1)}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              Back to Summary
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
              Hi {userName ? userName : "Supplier"}!
            </Text>
          </ImageBackground>
        </View>

        {/* Collect your Cash Card */}
        <View style={styles.cashCard}>
          <View>
            <Text style={styles.cashCardLabel}>Collect your Cash</Text>
            <Text style={styles.cashCardDate}>Date : 25/06/25</Text>
          </View>
          <Text style={styles.cashCardValue}>Rs 50,000.00</Text>
        </View>

        {/* This month's Supply Card */}
        <TouchableOpacity
          style={styles.supplyCard}
          activeOpacity={0.85}
          onPress={() => {
            router.push("/(role)/(supplier)/(nontabs)/income");
          }}
        >
          <Text style={styles.supplyCardLabel}>This month’s Supply</Text>
          <Text style={styles.supplyCardDate}>As at : 25/06/25</Text>
          <Text style={styles.supplyCardValue}>
            1000.5 <Text style={styles.supplyCardUnit}>kg</Text>
          </Text>
        </TouchableOpacity>

        {/* Wallet Card */}
        <TouchableOpacity onPress={() => router.push("/wallet")}>
          <View style={styles.supplyCard}>
            <Text style={styles.supplyCardLabel}>Wallet</Text>
            <Text style={styles.walletCardValue}>
              Rs <Text style={styles.walletCardValueNum}>50,000.00</Text>
            </Text>
          </View>
        </TouchableOpacity>

        {/* Supply Button (hide after confirming) */}
        {supplyState === "none" && !todayRequestId && !isLoadingToday && (
          <TouchableOpacity style={styles.supplyBtn} onPress={openSupplyModal}>
            <Text style={styles.supplyBtnText}>Supply</Text>
          </TouchableOpacity>
        )}

        {/* Request Placed Card */}
        {showRequestPlacedCard && (
          <TouchableOpacity
            style={styles.requestPlacedCard}
            onPress={() => {
              // Open the modal in "placed" state for edit/cancel
              sheetRef.current.open();
            }}
          >
            <Text style={styles.reqCardLabel}>Today&apos;s Supply :</Text>
            <Text
              style={[
                styles.reqCardDate,
                supplyState === "factoryReached" ? { color: "red" } : null,
              ]}
            >
              {supplyState === "factoryReached"
                ? "difference -0.5 kg"
                : supplyState === "factory"
                  ? "on the way to the factory"
                  : supplyState === "driver"
                    ? "Driver on the way, get your leaves ready"
                    : "Request Placed"}
            </Text>

            <Text style={styles.reqCardValue}>
              {supplyState === "factoryReached"
                ? "52.9"
                : supplyState === "factory"
                  ? "53.4"
                  : lastBagCount}
              <Text style={styles.supplyCardUnit}>
                {supplyState === "factoryReached" || supplyState === "factory"
                  ? "kg"
                  : "bags"}
              </Text>
            </Text>

            {supplyState === "placed" && (
              <Text style={styles.requestPlacedEdit}>
                Tap to Edit or Cancel
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
      {/* Bottom Sheet Modal */}
      <RBSheet
        ref={sheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.4)" },
          draggableIcon: { backgroundColor: "#bbb" },
          container: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
          },
        }}
        height={340}
      >
        {renderModalContent()}
      </RBSheet>

      {/* Simulation Bottom Sheet */}
      <RBSheet
        ref={simSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.4)" },
          draggableIcon: { backgroundColor: "#bbb" },
          container: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
          },
        }}
        height={340}
      >
        {renderSimulationSheet()}
      </RBSheet>
    </View>
  );
}

// ...Use the same styles as you provided (unchanged)

// ...styles unchanged (your existing styles)

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f8f4" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
    elevation: 4,
    zIndex: 10,
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  brandText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#183d2b",
    marginLeft: 6,
    letterSpacing: 1,
  },
  logo: { width: 40, height: 40, resizeMode: "contain" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  iconBtn: {
    marginRight: 16,
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#eee" },

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

  // Collect your Cash Card (red)
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

  // This month's Supply Card
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
  supplyCardDate1: {
    color: "#222",
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 3,
    marginTop: 10,
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

  // Wallet Card
  walletCard: {
    marginHorizontal: 18,
    marginTop: 0,
    backgroundColor: "#f7fff7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#b0c2b0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  walletCardLabel: {
    color: "#222",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
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

  // Supply Button
  supplyBtn: {
    backgroundColor: "#183d2b",
    borderRadius: 40,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 80,
    marginTop: 2,
    marginBottom: 8,
    elevation: 2,
  },
  supplyBtnText: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "400",
    letterSpacing: 1,
  },

  requestPlacedCard: {
    backgroundColor: "#eaf2ea",
    // borderRadius: 20,
    // marginHorizontal: 40,
    marginTop: 12,
    marginBottom: 18,
    // alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    elevation: 2,
    // borderWidth: 1,
    // borderColor: '#b0c2b0',
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  reqCardLabel: {
    color: "#222",
    fontSize: 25,
    fontWeight: "400",
    marginBottom: 1,
  },
  reqCardDate: {
    color: "#222",
    fontSize: 13,
    opacity: 0.7,
  },
  reqCardValue: {
    color: "#000",
    fontSize: 50,
    fontWeight: "700",
    marginLeft: 185,
  },
  requestPlacedEdit: {
    color: "#888",
    fontSize: 13,
  },

  driverModal: {
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
    paddingTop: 8,
  },
  driverModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  driverModalBags: {
    fontSize: 38,
    fontWeight: "700",
    color: "#000",
    marginLeft: 30,
  },
  driverModalSub: {
    color: "#222",
    fontSize: 15,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  driverCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#183d2b",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 50,
    padding: 12,
    marginBottom: 16,
    width: "100%",
  },
  driverImg: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: "#ddd",
  },
  driverName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  driverStatus: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 2,
  },
  driverVehicle: {
    color: "#fff",
    fontSize: 13,
    marginTop: 2,
  },
  driverModel: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.8,
  },
  pickupLabel: {
    color: "#222",
    fontSize: 16,
    marginTop: 1,
    marginBottom: 2,
    fontWeight: "600",
  },
  pickupTime: {
    color: "#183d2b",
    fontWeight: "bold",
    fontSize: 18,
  },
  callBtn: {
    backgroundColor: "#183d2b",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
    width: 120,
    alignSelf: "center",
  },
  callBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
    textAlign: "center",
  },

  // Modal styles
  sheetContent: { flex: 1, alignItems: "center" },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#183d2b",
    marginBottom: 6,
  },
  sheetSubtitle: { fontSize: 15, color: "#666", marginBottom: 18 },
  sheetInput: {
    width: "90%",
    backgroundColor: "#D5E6E3",
    borderRadius: 30,
    paddingHorizontal: 40,
    paddingVertical: 10,
    fontSize: 18,
    color: "#222",
    marginBottom: 18,
    marginTop: 18,
    textAlign: "center",
    fontWeight: "600",
  },
  sheetBtn: {
    minWidth: 120,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },

  sheetBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  sheetBtnText1: { color: "#000", fontSize: 17, fontWeight: "700" },
  supplyCount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#183d2b",
    marginTop: 12,
  },
  supplyUnit: { fontSize: 18, color: "#888", fontWeight: "400" },
});
