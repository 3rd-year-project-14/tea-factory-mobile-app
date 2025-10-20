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
  getDashboardSummary,
  getDriverWeight,
  getBagWeightsBySupplyRequest,
} from "../../../services/supplierService";
import { usePullToRefresh } from "../../../hooks/usePullToRefresh";

export default function SupplierHome({ navigation }) {
  const [userName, setUserName] = useState("");
  const sheetRef = useRef();
  const simSheetRef = useRef(); // <-- New ref for simulation sheet
  const weightDetailsSheetRef = useRef(); // <-- New ref for driver weight details sheet
  const factoryWeightDetailsSheetRef = useRef(); // <-- New ref for factory weight details sheet
  const router = useRouter();

  const [supplyState, setSupplyState] = useState("none"); // 'none', 'input', 'placed', 'driver', 'factory'

  const [bagCount, setBagCount] = useState("");
  const [lastBagCount, setLastBagCount] = useState(null);
  const [todayRequestId, setTodayRequestId] = useState(null);
  const [todayBagCount, setTodayBagCount] = useState(null);
  const [isLoadingToday, setIsLoadingToday] = useState(true);

  const [simPage, setSimPage] = useState(1);

  const [dashboardSummary, setDashboardSummary] = useState({
    totalNetWeight: 0,
    averageTeaRate: 0,
    approvedCashAdvancePayments: 0,
    approvedLoanPayments: 0,
  });

  const [weightData, setWeightData] = useState({
    driverWeight: null,
    factoryWeight: null,
    coarse: false,
    wet: false,
  });

  const [factoryWeightDetails, setFactoryWeightDetails] = useState({
    grossWeight: null,
    netWeight: null,
    water: null,
    coarse: null,
  });

  // Helper function to get quality status based on wet and coarse
  const getQualityStatus = (wet, coarse) => {
    const hasWet = wet === true || wet === "true";
    const hasCoarse = coarse === true || coarse === "true";

    if (hasWet && hasCoarse) {
      return { label: "WET / COARSE", color: "#d32f2f" }; // Red
    } else if (hasWet) {
      return { label: "WET", color: "#f57c00" }; // Orange
    } else if (hasCoarse) {
      return { label: "COARSE", color: "#f57c00" }; // Orange
    } else {
      return { label: "GOOD", color: "#2e7d32" }; // Green
    }
  };

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

  const fetchDashboardSummary = React.useCallback(async () => {
    try {
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
      if (!supplierId) return;
      const now = new Date();
      const month = now.getMonth() + 1; // 1-based
      const year = now.getFullYear();
      const response = await getDashboardSummary(supplierId, month, year);
      const data = response.data;
      setDashboardSummary(data);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
    }
  }, []);

  const fetchWeightData = React.useCallback(async () => {
    try {
      if (!todayRequestId) {
        console.log("[Weight] No todayRequestId available");
        return;
      }

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
        console.log("[Weight] No supplierId available");
        return;
      }

      console.log(
        `[Weight] Fetching weight data for requestId: ${todayRequestId}, supplierId: ${supplierId}`
      );
      const response = await getDriverWeight(todayRequestId, supplierId);
      const data = response.data;
      console.log("[Weight] API Response:", JSON.stringify(data));

      if (Array.isArray(data) && data.length > 0) {
        const weightInfo = data[0];
        console.log("[Weight] Weight Info (raw):", JSON.stringify(weightInfo));

        // Helper function to parse weight values
        const parseWeight = (value) => {
          if (value === null || value === undefined) return null;
          if (value === "false" || value === false) return null;
          const parsed = parseFloat(value);
          return !isNaN(parsed) ? parsed : null;
        };

        // Helper function to parse boolean values
        const parseBoolean = (value) => {
          if (value === true || value === "true") return true;
          if (value === false || value === "false") return false;
          return false; // default to false if null/undefined
        };

        const parsedData = {
          driverWeight: parseWeight(weightInfo.driverWeight),
          factoryWeight: parseWeight(weightInfo.factoryWeight),
          coarse: parseBoolean(weightInfo.coarse),
          wet: parseBoolean(weightInfo.wet),
        };

        console.log(
          "[Weight] Weight Info (parsed):",
          JSON.stringify(parsedData)
        );
        setWeightData(parsedData);
        console.log("[Weight] Weight data updated successfully");
      } else {
        console.log("[Weight] No weight data found in response");
      }
    } catch (error) {
      console.error("Error fetching weight data:", error);
      console.error("Error details:", error.response?.data || error.message);
    }
  }, [todayRequestId]);

  const fetchFactoryWeightDetails = React.useCallback(async () => {
    try {
      if (!todayRequestId) {
        console.log("[Factory Weight] No todayRequestId available");
        return;
      }

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
        console.log("[Factory Weight] No supplierId available");
        return;
      }

      console.log(
        `[Factory Weight] Fetching factory weight details for requestId: ${todayRequestId}, supplierId: ${supplierId}`
      );
      const response = await getBagWeightsBySupplyRequest(
        todayRequestId,
        supplierId
      );
      const data = response.data;
      console.log("[Factory Weight] API Response:", JSON.stringify(data));

      // Handle array response - take the first item
      const factoryData =
        Array.isArray(data) && data.length > 0 ? data[0] : data;

      if (factoryData && typeof factoryData === "object") {
        const parseWeight = (value) => {
          if (value === null || value === undefined) return null;
          const parsed = parseFloat(value);
          return !isNaN(parsed) ? parsed : null;
        };

        const factoryDetails = {
          grossWeight: parseWeight(factoryData.grossWeight),
          netWeight: parseWeight(factoryData.netWeight),
          water: parseWeight(factoryData.water),
          coarse: parseWeight(factoryData.coarse),
        };

        console.log(
          "[Factory Weight] Factory weight details (parsed):",
          JSON.stringify(factoryDetails)
        );
        setFactoryWeightDetails(factoryDetails);

        // Also update factoryWeight in weightData
        setWeightData((prev) => ({
          ...prev,
          factoryWeight: factoryDetails.netWeight,
        }));

        console.log(
          "[Factory Weight] Factory weight details updated successfully"
        );
      } else {
        console.log(
          "[Factory Weight] No factory weight data found in response"
        );
      }
    } catch (error) {
      console.error("Error fetching factory weight details:", error);
      console.error("Error details:", error.response?.data || error.message);
    }
  }, [todayRequestId]);

  const refreshData = React.useCallback(async () => {
    await loadUserName();
    await fetchSupplierRequests();
    await fetchDashboardSummary();
    await fetchWeightData();
    await fetchFactoryWeightDetails();
  }, [
    loadUserName,
    fetchSupplierRequests,
    fetchDashboardSummary,
    fetchWeightData,
    fetchFactoryWeightDetails,
  ]);

  const { refreshing, onRefresh } = usePullToRefresh(refreshData);

  // Fetch today's supply request for supplier on mount
  useEffect(() => {
    loadUserName();
    fetchSupplierRequests();
    fetchDashboardSummary();
  }, [loadUserName, fetchSupplierRequests, fetchDashboardSummary]);

  // Fetch weight data when todayRequestId changes
  useEffect(() => {
    if (todayRequestId) {
      fetchWeightData();
      fetchFactoryWeightDetails();
    }
  }, [todayRequestId, fetchWeightData, fetchFactoryWeightDetails]);

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
    // Always attempt to delete from backend if todayRequestId exists
    if (todayRequestId) {
      try {
        await deleteTeaSupplyRequest(todayRequestId);
      } catch (_error) {
        // Could not delete from backend
      }
    } else if (requestId) {
      try {
        await deleteTeaSupplyRequest(requestId);
      } catch (_error) {
        // Could not delete from backend
      }
    }
    setTodayRequestId(null);
    setTodayBagCount(null);
    setRequestId(null);
    setLastBagCount(null);
    setWeightData({
      driverWeight: null,
      factoryWeight: null,
      coarse: false,
      wet: false,
    });
    setSupplyState("none");
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 16,
            }}
          >
            <TouchableOpacity
              style={[
                styles.sheetBtn,
                {
                  backgroundColor: requestId ? "#183d2b" : "#bbb",
                  marginRight: 10,
                  maxWidth: 120,
                },
              ]}
              onPress={handleEdit}
              disabled={!requestId}
            >
              <Text style={styles.sheetBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sheetBtn,
                { backgroundColor: "#590804", maxWidth: 120 },
              ]}
              onPress={handleCancel}
            >
              <Text style={styles.sheetBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
          {new Date().getHours() >= 16 && (
            <TouchableOpacity
              style={[
                styles.sheetBtn,
                { backgroundColor: "#fff", marginTop: 18 },
              ]}
              onPress={() => {
                setSupplyState("driver");
                sheetRef.current.close();
              }}
            >
              <Text style={styles.sheetBtnText1}>
                Simulate Driver On The Way
              </Text>
            </TouchableOpacity>
          )}
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

  // Open weight details sheet
  const openWeightDetailsSheet = () => {
    weightDetailsSheetRef.current.open();
  };

  // Open factory weight details sheet
  const openFactoryWeightDetailsSheet = () => {
    factoryWeightDetailsSheetRef.current.open();
  };

  // Weight Details Sheet Content
  const renderWeightDetailsSheet = () => {
    const hasDriverWeight =
      weightData.driverWeight !== null && weightData.driverWeight !== undefined;
    const qualityStatus = getQualityStatus(weightData.wet, weightData.coarse);

    return (
      <View style={styles.weightDetailsContent}>
        <Text style={styles.weightDetailsTitle}>Driver Weight Details</Text>

        <View style={styles.weightDetailRow}>
          <Text style={styles.weightDetailLabel}>Total Weight:</Text>
          <Text style={styles.weightDetailValue}>
            {hasDriverWeight ? weightData.driverWeight.toFixed(1) : "0.0"} kg
          </Text>
        </View>

        <View style={styles.weightDetailRow}>
          <Text style={styles.weightDetailLabel}>Quality Status:</Text>
          <View
            style={[
              styles.qualityBadgeInline,
              { backgroundColor: qualityStatus.color },
            ]}
          >
            <Text style={styles.qualityBadgeText}>{qualityStatus.label}</Text>
          </View>
        </View>

        {/* Show detailed status info */}
        <View style={styles.statusInfoContainer}>
          <View style={styles.statusInfoRow}>
            <Text style={styles.statusInfoLabel}>Wet:</Text>
            <Text
              style={[
                styles.statusInfoValue,
                weightData.wet ? styles.statusTrue : styles.statusFalse,
              ]}
            >
              {weightData.wet ? "Yes" : "No"}
            </Text>
          </View>
          <View style={styles.statusInfoRow}>
            <Text style={styles.statusInfoLabel}>Coarse:</Text>
            <Text
              style={[
                styles.statusInfoValue,
                weightData.coarse ? styles.statusTrue : styles.statusFalse,
              ]}
            >
              {weightData.coarse ? "Yes" : "No"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.closeDetailsBtn}
          onPress={() => weightDetailsSheetRef.current.close()}
        >
          <Text style={styles.closeDetailsBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Factory Weight Details Sheet Content
  const renderFactoryWeightDetailsSheet = () => {
    const hasGrossWeight = factoryWeightDetails.grossWeight !== null;
    const hasNetWeight = factoryWeightDetails.netWeight !== null;
    const hasWater = factoryWeightDetails.water !== null;
    const hasCoarse = factoryWeightDetails.coarse !== null;

    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.weightDetailsContent}>
          <Text style={styles.weightDetailsTitle}>Factory Weight Details</Text>

          {hasGrossWeight && (
            <View style={styles.weightDetailRow}>
              <Text style={styles.weightDetailLabel}>Gross Weight:</Text>
              <Text style={styles.weightDetailValue}>
                {factoryWeightDetails.grossWeight.toFixed(1)} kg
              </Text>
            </View>
          )}

          {hasNetWeight && (
            <View style={styles.weightDetailRow}>
              <Text style={styles.weightDetailLabel}>Net Weight:</Text>
              <Text style={styles.weightDetailValue}>
                {factoryWeightDetails.netWeight.toFixed(1)} kg
              </Text>
            </View>
          )}

          {hasWater && (
            <View style={styles.weightDetailRow}>
              <Text style={styles.weightDetailLabel}>Water:</Text>
              <Text style={styles.weightDetailValue}>
                {factoryWeightDetails.water.toFixed(1)} kg
              </Text>
            </View>
          )}

          {hasCoarse && (
            <View style={styles.weightDetailRow}>
              <Text style={styles.weightDetailLabel}>Coarse:</Text>
              <Text style={styles.weightDetailValue}>
                {factoryWeightDetails.coarse.toFixed(1)} kg
              </Text>
            </View>
          )}

          {!hasGrossWeight && !hasNetWeight && !hasWater && !hasCoarse && (
            <View style={styles.noDetailsContainer}>
              <Text style={styles.noDetailsText}>
                No factory weight data available
              </Text>
              <Text style={styles.noDetailsSubText}>
                Factory weight details will appear here once processing is
                complete
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.closeDetailsBtn}
            onPress={() => factoryWeightDetailsSheetRef.current.close()}
          >
            <Text style={styles.closeDetailsBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

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
        {dashboardSummary.approvedCashAdvancePayments +
          dashboardSummary.approvedLoanPayments >
          0 && (
          <View style={styles.cashCard}>
            <View>
              <Text style={styles.cashCardLabel}>Collect your Cash</Text>
              <Text style={styles.cashCardDate}>
                Date : {new Date().toLocaleDateString("en-GB")}
              </Text>
            </View>
            <Text style={styles.cashCardValue}>
              Rs{" "}
              {(
                dashboardSummary.approvedCashAdvancePayments +
                dashboardSummary.approvedLoanPayments
              ).toFixed(2)}
            </Text>
          </View>
        )}

        {/* This month's Supply Card */}
        <TouchableOpacity
          style={styles.supplyCard}
          activeOpacity={0.85}
          onPress={() => {
            router.push("/(role)/(supplier)/(nontabs)/income");
          }}
        >
          <Text style={styles.supplyCardLabel}>This month’s Supply</Text>
          <Text style={styles.supplyCardDate}>
            As at : {new Date().toLocaleDateString("en-GB")}
          </Text>
          <Text style={styles.supplyCardValue}>
            {dashboardSummary.totalNetWeight.toFixed(1)}{" "}
            <Text style={styles.supplyCardUnit}>kg</Text>
          </Text>
        </TouchableOpacity>

        {/* Wallet Card */}
        <TouchableOpacity onPress={() => router.push("/wallet")}>
          <View style={styles.supplyCard}>
            <Text style={styles.supplyCardLabel}>Estimated Wallet</Text>
            <Text style={styles.walletCardValue}>
              Rs{" "}
              <Text style={styles.walletCardValueNum}>
                {(
                  dashboardSummary.totalNetWeight *
                  dashboardSummary.averageTeaRate
                ).toFixed(2)}
              </Text>
            </Text>
          </View>
        </TouchableOpacity>

        {/* Weight Cards - Driver and Factory */}
        {(weightData.driverWeight !== null ||
          weightData.factoryWeight !== null) && (
          <View style={styles.weightCardsContainer}>
            {weightData.driverWeight !== null &&
              typeof weightData.driverWeight === "number" && (
                <TouchableOpacity
                  style={styles.weightCard}
                  onPress={openWeightDetailsSheet}
                  activeOpacity={0.7}
                >
                  <Text style={styles.weightCardLabel}>Driver Weight</Text>
                  <Text style={styles.weightCardValue}>
                    {weightData.driverWeight.toFixed(1)}{" "}
                    <Text style={styles.weightCardUnit}>kg</Text>
                  </Text>
                  {/* Quality Status Badge */}
                  {(() => {
                    const status = getQualityStatus(
                      weightData.wet,
                      weightData.coarse
                    );
                    return (
                      <View
                        style={[
                          styles.qualityBadge,
                          { backgroundColor: status.color },
                        ]}
                      >
                        <Text style={styles.qualityBadgeText}>
                          {status.label}
                        </Text>
                      </View>
                    );
                  })()}
                  <Text style={styles.tapForDetailsText}>Tap for details</Text>
                </TouchableOpacity>
              )}

            {/* Factory Weight Card - Show when weight is available */}
            {weightData.factoryWeight !== null &&
              typeof weightData.factoryWeight === "number" && (
                <TouchableOpacity
                  style={styles.weightCard}
                  onPress={openFactoryWeightDetailsSheet}
                  activeOpacity={0.7}
                >
                  <Text style={styles.weightCardLabel}>Factory Weight</Text>
                  <Text style={styles.weightCardValue}>
                    {weightData.factoryWeight.toFixed(1)}{" "}
                    <Text style={styles.weightCardUnit}>kg</Text>
                  </Text>
                  <Text style={styles.tapForDetailsText}>Tap for details</Text>
                </TouchableOpacity>
              )}

            {/* Factory Weight Card - Show pending state when request exists but no factory weight yet */}
            {todayRequestId &&
              (weightData.factoryWeight === null ||
                typeof weightData.factoryWeight !== "number") && (
                <View style={[styles.weightCard, styles.pendingWeightCard]}>
                  <Text style={styles.weightCardLabel}>Factory Weight</Text>
                  <Text style={[styles.weightCardValue, styles.pendingText]}>
                    Pending
                  </Text>
                  <Text style={styles.pendingSubtext}>
                    Processing at factory
                  </Text>
                </View>
              )}
          </View>
        )}

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

      {/* Weight Details Bottom Sheet */}
      <RBSheet
        ref={weightDetailsSheetRef}
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
        height={400}
      >
        {renderWeightDetailsSheet()}
      </RBSheet>

      {/* Factory Weight Details Bottom Sheet */}
      <RBSheet
        ref={factoryWeightDetailsSheetRef}
        customStyles={{
          container: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
          },
        }}
        height={450}
      >
        {renderFactoryWeightDetailsSheet()}
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

  // Weight Cards Container
  weightCardsContainer: {
    flexDirection: "row",
    marginHorizontal: 18,
    marginTop: 0,
    marginBottom: 10,
    gap: 8,
  },
  weightCard: {
    flex: 1,
    backgroundColor: "#eaf2ea",
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#b0c2b0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  weightCardLabel: {
    color: "#222",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  weightCardValue: {
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  weightCardUnit: {
    fontSize: 12,
    color: "#888",
    fontWeight: "400",
  },
  weightCardDetails: {
    marginTop: 8,
    alignItems: "center",
  },
  weightCardDetailText: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
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
  sheetContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  sheetTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#183d2b",
    marginBottom: 8,
  },
  sheetInput: {
    height: 54,
    width: "100%",
    maxWidth: 300,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    fontSize: 18,
    marginTop: 12,
  },
  supplyUnit: {
    fontSize: 16,
    color: "#888",
    fontWeight: "400",
  },
  sheetBtn: {
    height: 54,
    width: "100%",
    maxWidth: 300,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  sheetBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  sheetBtnText1: {
    color: "#183d2b",
    fontSize: 18,
    fontWeight: "700",
  },

  // Weight Details Sheet Styles
  weightDetailsContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  weightDetailsTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#183d2b",
    marginBottom: 24,
  },
  weightDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: 300,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 12,
  },
  weightDetailLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  weightDetailValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#183d2b",
  },
  noDetailsContainer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  noDetailsText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 8,
  },
  noDetailsSubText: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 18,
  },
  closeDetailsBtn: {
    backgroundColor: "#183d2b",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 24,
  },
  closeDetailsBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  tapForDetailsText: {
    fontSize: 9,
    color: "#888",
    marginTop: 4,
    textAlign: "center",
  },

  // Pending Weight Card Styles
  pendingWeightCard: {
    backgroundColor: "#f9f9f9",
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  pendingText: {
    color: "#999",
    fontSize: 18,
  },
  pendingSubtext: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 4,
    textAlign: "center",
    fontStyle: "italic",
  },

  // Quality Badge Styles
  qualityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: "center",
  },
  qualityBadgeInline: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  qualityBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },

  // Status Info Styles
  statusInfoContainer: {
    width: "100%",
    maxWidth: 300,
    marginTop: 16,
    marginBottom: 8,
  },
  statusInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 8,
  },
  statusInfoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  statusInfoValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  statusTrue: {
    color: "#d32f2f",
  },
  statusFalse: {
    color: "#2e7d32",
  },
});
