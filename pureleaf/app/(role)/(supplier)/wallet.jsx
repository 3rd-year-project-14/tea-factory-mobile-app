import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  RefreshControl,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import SlideToConfirm from "rn-slide-to-confirm";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  requestAdvance,
  getAdvanceRequests,
  editAdvanceRequest,
  deleteAdvanceRequest,
  requestLoan,
  getLoanRequestsBySupplier,
  getLoansBySupplier,
  editLoanRequest,
  deleteLoanRequest,
  getPaymentHistory,
  getDashboardSummary,
} from "../../../services/supplierService";
import { usePullToRefresh } from "../../../hooks/usePullToRefresh";

const monthsArray = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const currentMonthIndex = new Date().getMonth();
const months = [
  ...monthsArray.slice(currentMonthIndex),
  ...monthsArray.slice(0, currentMonthIndex),
];

const statusSort = { APPROVED: 1, PENDING: 0, REJECTED: 0 };

export default function WalletPage() {
  // 👇 All necessary state hooks are defined properly INSIDE the component now

  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceType, setAdvanceType] = useState("");
  const [advancePurpose, setAdvancePurpose] = useState("");
  const [advanceError, setAdvanceError] = useState("");
  const [existingAdvances, setExistingAdvances] = useState([]);
  const [existingLoans, setExistingLoans] = useState([]);
  const [approvedLoans, setApprovedLoans] = useState([]);
  const [advanceLoading, setAdvanceLoading] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentsHistory, setPaymentsHistory] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 is current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentType, setPaymentType] = useState("Cash");
  const [showSelector, setShowSelector] = useState(false);
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [slideConfirmed, setSlideConfirmed] = useState(false);
  const [showLoanDetails, setShowLoanDetails] = useState(false);
  // Request Loan modal state
  const [showRequestLoanModal, setShowRequestLoanModal] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [loanDuration, setLoanDuration] = useState("3 Month");
  const [loanRequestLoading, setLoanRequestLoading] = useState(false);
  const [loanRequested, setLoanRequested] = useState(false);
  const [loanData, setLoanData] = useState(null);
  // Edit loan modal state
  const [showEditLoanModal, setShowEditLoanModal] = useState(false);
  const [editLoanAmount, setEditLoanAmount] = useState("");
  const [editLoanDuration, setEditLoanDuration] = useState("3 Month");
  const [selectedLoanForEdit, setSelectedLoanForEdit] = useState(null);
  const [editLoanLoading, setEditLoanLoading] = useState(false);
  // Delete loan confirmation state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedLoanForDelete, setSelectedLoanForDelete] = useState(null);
  const [deleteLoanLoading, setDeleteLoanLoading] = useState(false);
  // Edit advance modal state
  const [showEditAdvanceModal, setShowEditAdvanceModal] = useState(false);
  const [editAdvanceAmount, setEditAdvanceAmount] = useState("");
  const [editAdvanceType, setEditAdvanceType] = useState("");
  const [editAdvancePurpose, setEditAdvancePurpose] = useState("");
  const [selectedAdvanceForEdit, setSelectedAdvanceForEdit] = useState(null);
  const [editAdvanceLoading, setEditAdvanceLoading] = useState(false);
  // Delete advance confirmation state
  const [showDeleteAdvanceConfirmation, setShowDeleteAdvanceConfirmation] =
    useState(false);
  const [selectedAdvanceForDelete, setSelectedAdvanceForDelete] =
    useState(null);
  const [deleteAdvanceLoading, setDeleteAdvanceLoading] = useState(false);

  const [dashboardSummary, setDashboardSummary] = useState({
    totalNetWeight: 0,
    averageTeaRate: 0,
    approvedCashAdvancePayments: 0,
    approvedLoanPayments: 0,
  });

  const refreshData = useCallback(async () => {
    try {
      const supplierDataStr = await AsyncStorage.getItem("supplierData");
      let supplierId = null;
      if (supplierDataStr) {
        const supplierData = JSON.parse(supplierDataStr);
        if (Array.isArray(supplierData) && supplierData.length > 0) {
          supplierId = supplierData[0].supplierId;
        } else if (supplierData && supplierData.supplierId) {
          supplierId = supplierData.supplierId;
        }
      }
      console.log("Retrieved supplierId:", supplierId);
      if (supplierId) {
        console.log("Making API calls for supplierId:", supplierId);
        const [advanceResponse, loanRequestResponse, loanResponse] =
          await Promise.all([
            getAdvanceRequests(supplierId),
            getLoanRequestsBySupplier(supplierId),
            getLoansBySupplier(supplierId),
          ]);
        console.log("Advance requests response:", advanceResponse.data);
        console.log("Loan requests response:", loanRequestResponse.data);
        console.log("Loans response:", loanResponse.data);
        setExistingAdvances(advanceResponse.data);
        setExistingLoans(loanRequestResponse.data);
        setApprovedLoans(loanResponse.data);
      } else {
        console.log("No supplierId found, skipping API calls");
      }
    } catch (error) {
      console.error("Error in refreshData:", error);
      console.error("Error details:", error?.response?.data || error.message);
    }
    await fetchDashboardSummary();
  }, [fetchDashboardSummary]);

  const fetchDashboardSummary = useCallback(async () => {
    try {
      const supplierDataStr = await AsyncStorage.getItem("supplierData");
      let supplierId = null;
      if (supplierDataStr) {
        const supplierData = JSON.parse(supplierDataStr);
        if (Array.isArray(supplierData) && supplierData.length > 0) {
          supplierId = supplierData[0].supplierId;
        } else if (supplierData && supplierData.supplierId) {
          supplierId = supplierData.supplierId;
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

  const { refreshing, onRefresh } = usePullToRefresh(refreshData);

  const filteredPayments = useMemo(() => {
    return paymentsHistory
      .filter((p) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return (
          p.paymentType.toLowerCase().includes(term) ||
          p.paymentDate.toLowerCase().includes(term) ||
          p.status.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        if (statusSort[a.status] !== statusSort[b.status])
          return statusSort[a.status] - statusSort[b.status];
        if (a.paymentDate !== b.paymentDate)
          return b.paymentDate.localeCompare(a.paymentDate);
        return b.paymentId.localeCompare(a.paymentId);
      });
  }, [searchTerm, paymentsHistory]);

  // Determine which loan to display: approved loan if exists, else requested loan
  const displayLoan = useMemo(() => {
    if (approvedLoans.length > 0) {
      // Show the first approved loan
      return approvedLoans[0];
    }
    return loanData;
  }, [approvedLoans, loanData]);

  const money = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2 });

  const fetchPaymentsHistory = useCallback(async () => {
    try {
      setLoadingPayments(true);
      const supplierDataStr = await AsyncStorage.getItem("supplierData");
      let supplierId = null;
      if (supplierDataStr) {
        const supplierData = JSON.parse(supplierDataStr);
        if (Array.isArray(supplierData) && supplierData.length > 0) {
          supplierId = supplierData[0].supplierId;
        } else if (supplierData && supplierData.supplierId) {
          supplierId = supplierData.supplierId;
        }
      }
      if (supplierId) {
        const actualMonth = ((currentMonthIndex + selectedMonth) % 12) + 1;
        const response = await getPaymentHistory(
          supplierId,
          actualMonth,
          selectedYear
        );
        setPaymentsHistory(response.data);
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
      setPaymentsHistory([]);
    } finally {
      setLoadingPayments(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (showHistory) {
      fetchPaymentsHistory();
    }
  }, [showHistory, fetchPaymentsHistory]);

  // Fetch existing advances, loan requests, and loans when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchExistingRequests = async () => {
        try {
          const supplierDataStr = await AsyncStorage.getItem("supplierData");
          let supplierId = null;
          if (supplierDataStr) {
            const supplierData = JSON.parse(supplierDataStr);
            if (Array.isArray(supplierData) && supplierData.length > 0) {
              supplierId = supplierData[0].supplierId;
            } else if (supplierData && supplierData.supplierId) {
              supplierId = supplierData.supplierId;
            }
          }
          console.log("Focus effect - Retrieved supplierId:", supplierId);
          if (supplierId) {
            console.log(
              "Focus effect - Making API calls for supplierId:",
              supplierId
            );
            const [advanceResponse, loanRequestResponse, loanResponse] =
              await Promise.all([
                getAdvanceRequests(supplierId),
                getLoanRequestsBySupplier(supplierId),
                getLoansBySupplier(supplierId),
              ]);
            console.log(
              "Focus effect - Advance requests response:",
              advanceResponse.data
            );
            console.log(
              "Focus effect - Loan requests response:",
              loanRequestResponse.data
            );
            console.log("Focus effect - Loans response:", loanResponse.data);
            setExistingAdvances(advanceResponse.data);
            setExistingLoans(loanRequestResponse.data);
            setApprovedLoans(loanResponse.data);
          } else {
            console.log(
              "Focus effect - No supplierId found, skipping API calls"
            );
          }
        } catch (error) {
          console.error(
            "Focus effect - Error fetching existing requests:",
            error
          );
          console.error(
            "Focus effect - Error details:",
            error?.response?.data || error.message
          );
        }
        await fetchDashboardSummary();
      };
      fetchExistingRequests();
    }, [fetchDashboardSummary])
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* === WALLET CARD === */}
          <View style={styles.walletCard}>
            <Text style={styles.walletTitle}>My Estimated Wallet</Text>
            <Text style={styles.walletAmount}>
              <Text style={{ fontWeight: "bold" }}>Rs </Text>
              <Text style={styles.amountValue}>
                {(
                  dashboardSummary.totalNetWeight *
                  dashboardSummary.averageTeaRate
                ).toFixed(2)}
              </Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowSelector(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.paymentType}>
                Payment type :{" "}
                <Text style={{ fontWeight: "600" }}>{paymentType}</Text>
              </Text>
            </TouchableOpacity>
            <View style={styles.walletBtnRow}>
              <TouchableOpacity
                style={[
                  styles.walletBtn,
                  (loanRequested || existingLoans.length > 0) && {
                    backgroundColor: "#999",
                  },
                ]}
                onPress={() => setShowRequestLoanModal(true)}
                disabled={loanRequested || existingLoans.length > 0}
              >
                <Text style={styles.walletBtnText}>Request{"\n"}Loan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.walletBtn}
                onPress={() => setShowAdvanceModal(true)}
              >
                <Text style={styles.walletBtnText}>Request{"\n"}Advance</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* === Requested Advance Cards === */}
          {existingAdvances.length > 0 &&
            existingAdvances.map((item, index) => (
              <View key={index} style={styles.collectCard}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Text style={styles.collectTitle}>Advance Request</Text>
                  <Text style={styles.collectAmount}>
                    Rs{" "}
                    {Number(
                      item.requestedAmount || item.amount
                    ).toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.collectDate}>
                  Payment Method : {item.paymentMethod || item.type}
                </Text>
                <Text style={styles.collectDate}>Status : {item.status}</Text>
                {(item.createdAt ||
                  item.requestedDate ||
                  item.requested_date ||
                  item.date) && (
                  <Text style={styles.collectDate}>
                    Date :{" "}
                    {new Date(
                      item.createdAt ||
                        item.requestedDate ||
                        item.requested_date ||
                        item.date
                    ).toLocaleDateString("en-GB")}
                  </Text>
                )}
                {item.purpose && (
                  <Text style={styles.collectDate}>
                    Purpose : {item.purpose}
                  </Text>
                )}
                {item.status === "REJECTED" && item.rejectionReason && (
                  <Text style={[styles.collectDate, { color: "#B3292A" }]}>
                    Rejection Reason : {item.rejectionReason}
                  </Text>
                )}
                {item.status === "REQUESTED" && (
                  <View style={styles.loanActionButtons}>
                    <TouchableOpacity
                      style={[styles.loanActionBtn, styles.editBtn]}
                      onPress={() => {
                        setSelectedAdvanceForEdit(item);
                        setEditAdvanceAmount(
                          item.requestedAmount?.toString() ||
                            item.amount?.toString() ||
                            ""
                        );
                        setEditAdvanceType(
                          item.paymentMethod === "CASH" ? "Cash" : "Bank"
                        );
                        setEditAdvancePurpose(item.purpose || "");
                        setShowEditAdvanceModal(true);
                      }}
                    >
                      <Ionicons name="pencil" size={16} color="#fff" />
                      <Text style={styles.loanActionBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.loanActionBtn, styles.deleteBtn]}
                      onPress={() => {
                        setSelectedAdvanceForDelete(item);
                        setShowDeleteAdvanceConfirmation(true);
                      }}
                    >
                      <Ionicons name="trash" size={16} color="#fff" />
                      <Text style={styles.loanActionBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

          {/* === Requested Loan Cards === */}
          {existingLoans.length > 0 &&
            existingLoans.map((item, index) => (
              <View key={index} style={styles.collectCard}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Text style={styles.collectTitle}>Loan Request</Text>
                  <Text style={styles.collectAmount}>
                    Rs {Number(item.amount).toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.collectDate}>Months : {item.months}</Text>
                <Text style={styles.collectDate}>Status : {item.status}</Text>
                {item.date && (
                  <Text style={styles.collectDate}>
                    Date : {new Date(item.date).toLocaleDateString("en-GB")}
                  </Text>
                )}
                {item.status === "PENDING" && (
                  <View style={styles.loanActionButtons}>
                    <TouchableOpacity
                      style={[styles.loanActionBtn, styles.editBtn]}
                      onPress={() => {
                        setSelectedLoanForEdit(item);
                        setEditLoanAmount(item.amount.toString());
                        setEditLoanDuration(`${item.months} Month`);
                        setShowEditLoanModal(true);
                      }}
                    >
                      <Ionicons name="pencil" size={16} color="#fff" />
                      <Text style={styles.loanActionBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.loanActionBtn, styles.deleteBtn]}
                      onPress={() => {
                        setSelectedLoanForDelete(item);
                        setShowDeleteConfirmation(true);
                      }}
                    >
                      <Ionicons name="trash" size={16} color="#fff" />
                      <Text style={styles.loanActionBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

          {/* === Request Advance Modal === */}
          <Modal
            visible={showAdvanceModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowAdvanceModal(false)}
          >
            <TouchableWithoutFeedback
              onPress={() => setShowAdvanceModal(false)}
            >
              <View style={styles.loanModalBackdrop}>
                <TouchableWithoutFeedback>
                  <View style={styles.advancePopup}>
                    <Text style={styles.loanPopupTitle}>Request Advance</Text>

                    <Text style={styles.advanceLabel}>Amount *</Text>
                    <TextInput
                      style={styles.advanceInput}
                      keyboardType="numeric"
                      placeholder="Enter amount"
                      placeholderTextColor="#999"
                      maxLength={9}
                      value={advanceAmount}
                      onChangeText={(value) => {
                        if (/^\d*$/.test(value)) setAdvanceAmount(value);
                      }}
                    />

                    <Text style={styles.advanceLabel}>Payment Type *</Text>
                    <View style={styles.advanceDropdown}>
                      {["Cash", "Bank"].map((type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => setAdvanceType(type)}
                          style={[
                            styles.advanceDropdownItem,
                            advanceType === type &&
                              styles.advanceDropdownItemSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.advanceDropdownText,
                              advanceType === type &&
                                styles.advanceDropdownTextSelected,
                            ]}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.advanceLabel}>Purpose (Optional)</Text>
                    <TextInput
                      style={styles.advanceInput}
                      placeholder="Enter purpose"
                      placeholderTextColor="#999"
                      value={advancePurpose}
                      onChangeText={setAdvancePurpose}
                      maxLength={100}
                    />

                    {advanceError !== "" && (
                      <Text style={styles.advanceErrorText}>
                        {advanceError}
                      </Text>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.advanceRequestBtn,
                        (!(advanceAmount && advanceType) || advanceLoading) && {
                          backgroundColor: "#ccc",
                        },
                      ]}
                      disabled={
                        !(advanceAmount && advanceType) || advanceLoading
                      }
                      onPress={async () => {
                        if (!advanceAmount || !advanceType) {
                          setAdvanceError("All fields are required.");
                          return;
                        }
                        setAdvanceLoading(true);
                        try {
                          const supplierDataStr =
                            await AsyncStorage.getItem("supplierData");
                          let supplierId = null;
                          if (supplierDataStr) {
                            const supplierData = JSON.parse(supplierDataStr);
                            if (
                              Array.isArray(supplierData) &&
                              supplierData.length > 0
                            ) {
                              supplierId = supplierData[0].supplierId;
                            } else if (
                              supplierData &&
                              supplierData.supplierId
                            ) {
                              supplierId = supplierData.supplierId;
                            }
                          }
                          if (!supplierId) {
                            setAdvanceError("Supplier ID not found.");
                            setAdvanceLoading(false);
                            return;
                          }
                          const paymentMethod =
                            advanceType === "Cash" ? "CASH" : "BANK";
                          console.log("Advance Request Data:", {
                            supplierId,
                            requestedAmount: advanceAmount,
                            paymentMethod,
                            purpose: advancePurpose || null,
                          });
                          const response = await requestAdvance(
                            supplierId,
                            advanceAmount,
                            paymentMethod,
                            advancePurpose || null
                          );
                          const created = response.data;
                          // Add the new advance to existing advances for immediate display
                          setExistingAdvances((prev) => [
                            ...prev,
                            {
                              reqId:
                                created.reqId ||
                                created.id ||
                                created.requestId,
                              supplierId:
                                created.supplierId ||
                                (created.supplier &&
                                  created.supplier.supplierId),
                              requestedAmount:
                                created.requestedAmount || created.amount,
                              paymentMethod:
                                created.paymentMethod || created.type,
                              purpose: created.purpose,
                              status: created.status || "REQUESTED",
                              createdAt:
                                created.createdAt ||
                                created.requestedDate ||
                                created.date,
                              requestedDate:
                                created.requestedDate ||
                                created.createdAt ||
                                created.date,
                              date:
                                created.date ||
                                created.createdAt ||
                                created.requestedDate,
                            },
                          ]);
                          // clear form
                          setAdvanceAmount("");
                          setAdvanceType("");
                          setAdvancePurpose("");
                          setAdvanceError("");
                          setShowAdvanceModal(false);
                        } catch (_error) {
                          setAdvanceError(
                            "Failed to request advance. Please try again."
                          );
                        } finally {
                          setAdvanceLoading(false);
                        }
                      }}
                    >
                      <Text style={styles.advanceRequestBtnText}>
                        {advanceLoading ? "Requesting..." : "Request"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* === REQUEST LOAN MODAL === */}
          <Modal
            visible={showRequestLoanModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowRequestLoanModal(false)}
          >
            <TouchableWithoutFeedback
              onPress={() => setShowRequestLoanModal(false)}
            >
              <View style={styles.loanModalBackdrop}>
                <TouchableWithoutFeedback>
                  <View style={styles.advancePopup}>
                    <Text style={styles.loanPopupTitle}>Request Loan</Text>

                    <Text style={styles.advanceLabel}>Amount *</Text>
                    <TextInput
                      style={styles.advanceInput}
                      keyboardType="numeric"
                      placeholder="Enter amount"
                      placeholderTextColor="#999"
                      maxLength={12}
                      value={loanAmount}
                      onChangeText={(v) => {
                        if (/^\d*$/.test(v)) setLoanAmount(v);
                      }}
                    />

                    <Text style={styles.advanceLabel}>Duration *</Text>
                    <View style={styles.advanceDropdown}>
                      {["3 Month", "6 Month", "12 Month"].map((d) => (
                        <TouchableOpacity
                          key={d}
                          onPress={() => setLoanDuration(d)}
                          style={[
                            styles.advanceDropdownItem,
                            loanDuration === d &&
                              styles.advanceDropdownItemSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.advanceDropdownText,
                              loanDuration === d &&
                                styles.advanceDropdownTextSelected,
                            ]}
                          >
                            {d}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.advanceRequestBtn,
                        (!(loanAmount && loanDuration) ||
                          loanRequestLoading) && { backgroundColor: "#ccc" },
                      ]}
                      disabled={
                        !(loanAmount && loanDuration) || loanRequestLoading
                      }
                      onPress={async () => {
                        if (!loanAmount || !loanDuration) return;
                        setLoanRequestLoading(true);
                        try {
                          // determine months from duration string like "3 Month"
                          const months =
                            Number(loanDuration.split(" ")[0]) || 3;

                          // get supplierId from AsyncStorage
                          const supplierDataStr =
                            await AsyncStorage.getItem("supplierData");
                          let supplierId = null;
                          if (supplierDataStr) {
                            const supplierData = JSON.parse(supplierDataStr);
                            if (
                              Array.isArray(supplierData) &&
                              supplierData.length > 0
                            ) {
                              supplierId = supplierData[0].supplierId;
                            } else if (
                              supplierData &&
                              supplierData.supplierId
                            ) {
                              supplierId = supplierData.supplierId;
                            }
                          }
                          if (!supplierId) {
                            setLoanRequestLoading(false);
                            return;
                          }

                          const response = await requestLoan(
                            supplierId,
                            loanAmount,
                            months
                          );
                          const created = response.data;
                          // map backend response into our UI state
                          setLoanData({
                            reqId:
                              created.reqId || created.id || created.requestId,
                            supplierId:
                              created.supplierId ||
                              (created.supplier && created.supplier.supplierId),
                            amount: created.amount || created.requestedAmount,
                            months: created.months || months,
                            date:
                              created.date ||
                              created.createdAt ||
                              created.requestedDate,
                            status: created.status || "PENDING",
                          });
                          setLoanRequested(true);
                          setShowRequestLoanModal(false);
                        } catch (err) {
                          console.log(
                            "Loan request error",
                            err?.response?.data || err.message || err
                          );
                        } finally {
                          setLoanRequestLoading(false);
                        }
                      }}
                    >
                      <Text style={styles.advanceRequestBtnText}>
                        {loanRequestLoading ? "Requesting..." : "Request Loan"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* === EDIT LOAN MODAL === */}
          <Modal
            visible={showEditLoanModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowEditLoanModal(false)}
          >
            <TouchableWithoutFeedback
              onPress={() => setShowEditLoanModal(false)}
            >
              <View style={styles.loanModalBackdrop}>
                <TouchableWithoutFeedback>
                  <View style={styles.advancePopup}>
                    <Text style={styles.loanPopupTitle}>Edit Loan Request</Text>

                    <Text style={styles.advanceLabel}>Amount *</Text>
                    <TextInput
                      style={styles.advanceInput}
                      keyboardType="numeric"
                      placeholder="Enter amount"
                      placeholderTextColor="#999"
                      maxLength={12}
                      value={editLoanAmount}
                      onChangeText={(v) => {
                        if (/^\d*$/.test(v)) setEditLoanAmount(v);
                      }}
                    />

                    <Text style={styles.advanceLabel}>Duration *</Text>
                    <View style={styles.advanceDropdown}>
                      {["3 Month", "6 Month", "12 Month"].map((d) => (
                        <TouchableOpacity
                          key={d}
                          onPress={() => setEditLoanDuration(d)}
                          style={[
                            styles.advanceDropdownItem,
                            editLoanDuration === d &&
                              styles.advanceDropdownItemSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.advanceDropdownText,
                              editLoanDuration === d &&
                                styles.advanceDropdownTextSelected,
                            ]}
                          >
                            {d}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.advanceRequestBtn,
                        (!(editLoanAmount && editLoanDuration) ||
                          editLoanLoading) && { backgroundColor: "#ccc" },
                      ]}
                      disabled={
                        !(editLoanAmount && editLoanDuration) || editLoanLoading
                      }
                      onPress={async () => {
                        if (
                          !editLoanAmount ||
                          !editLoanDuration ||
                          !selectedLoanForEdit
                        )
                          return;
                        setEditLoanLoading(true);
                        try {
                          const months =
                            Number(editLoanDuration.split(" ")[0]) || 3;

                          const supplierDataStr =
                            await AsyncStorage.getItem("supplierData");
                          let supplierId = null;
                          if (supplierDataStr) {
                            const supplierData = JSON.parse(supplierDataStr);
                            if (
                              Array.isArray(supplierData) &&
                              supplierData.length > 0
                            ) {
                              supplierId = supplierData[0].supplierId;
                            } else if (
                              supplierData &&
                              supplierData.supplierId
                            ) {
                              supplierId = supplierData.supplierId;
                            }
                          }

                          if (!supplierId) {
                            setEditLoanLoading(false);
                            return;
                          }

                          await editLoanRequest(
                            selectedLoanForEdit.reqId || selectedLoanForEdit.id,
                            supplierId,
                            editLoanAmount,
                            months
                          );

                          // Refresh data
                          refreshData();
                          setShowEditLoanModal(false);
                          setSelectedLoanForEdit(null);
                          setEditLoanAmount("");
                          setEditLoanDuration("3 Month");
                        } catch (err) {
                          console.log(
                            "Edit loan error",
                            err?.response?.data || err.message || err
                          );
                        } finally {
                          setEditLoanLoading(false);
                        }
                      }}
                    >
                      <Text style={styles.advanceRequestBtnText}>
                        {editLoanLoading ? "Updating..." : "Update Loan"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* === EDIT ADVANCE MODAL === */}
          <Modal
            visible={showEditAdvanceModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowEditAdvanceModal(false)}
          >
            <TouchableWithoutFeedback
              onPress={() => setShowEditAdvanceModal(false)}
            >
              <View style={styles.loanModalBackdrop}>
                <TouchableWithoutFeedback>
                  <View style={styles.advancePopup}>
                    <Text style={styles.loanPopupTitle}>
                      Edit Advance Request
                    </Text>

                    <Text style={styles.advanceLabel}>Amount *</Text>
                    <TextInput
                      style={styles.advanceInput}
                      keyboardType="numeric"
                      placeholder="Enter amount"
                      placeholderTextColor="#999"
                      maxLength={9}
                      value={editAdvanceAmount}
                      onChangeText={(value) => {
                        if (/^\d*$/.test(value)) setEditAdvanceAmount(value);
                      }}
                    />

                    <Text style={styles.advanceLabel}>Payment Type *</Text>
                    <View style={styles.advanceDropdown}>
                      {["Cash", "Bank"].map((type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => setEditAdvanceType(type)}
                          style={[
                            styles.advanceDropdownItem,
                            editAdvanceType === type &&
                              styles.advanceDropdownItemSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.advanceDropdownText,
                              editAdvanceType === type &&
                                styles.advanceDropdownTextSelected,
                            ]}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.advanceLabel}>Purpose (Optional)</Text>
                    <TextInput
                      style={styles.advanceInput}
                      placeholder="Enter purpose"
                      placeholderTextColor="#999"
                      value={editAdvancePurpose}
                      onChangeText={setEditAdvancePurpose}
                      maxLength={100}
                    />

                    <TouchableOpacity
                      style={[
                        styles.advanceRequestBtn,
                        (!(editAdvanceAmount && editAdvanceType) ||
                          editAdvanceLoading) && { backgroundColor: "#ccc" },
                      ]}
                      disabled={
                        !(editAdvanceAmount && editAdvanceType) ||
                        editAdvanceLoading
                      }
                      onPress={async () => {
                        if (
                          !editAdvanceAmount ||
                          !editAdvanceType ||
                          !selectedAdvanceForEdit
                        )
                          return;
                        setEditAdvanceLoading(true);
                        try {
                          const supplierDataStr =
                            await AsyncStorage.getItem("supplierData");
                          let supplierId = null;
                          if (supplierDataStr) {
                            const supplierData = JSON.parse(supplierDataStr);
                            if (
                              Array.isArray(supplierData) &&
                              supplierData.length > 0
                            ) {
                              supplierId = supplierData[0].supplierId;
                            } else if (
                              supplierData &&
                              supplierData.supplierId
                            ) {
                              supplierId = supplierData.supplierId;
                            }
                          }

                          if (!supplierId) {
                            setEditAdvanceLoading(false);
                            return;
                          }

                          const paymentMethod =
                            editAdvanceType === "Cash" ? "CASH" : "BANK";

                          await editAdvanceRequest(
                            selectedAdvanceForEdit.reqId ||
                              selectedAdvanceForEdit.id,
                            supplierId,
                            editAdvanceAmount,
                            editAdvancePurpose || null,
                            paymentMethod
                          );

                          // Refresh data
                          refreshData();
                          setShowEditAdvanceModal(false);
                          setSelectedAdvanceForEdit(null);
                          setEditAdvanceAmount("");
                          setEditAdvanceType("");
                          setEditAdvancePurpose("");
                        } catch (err) {
                          console.log(
                            "Edit advance error",
                            err?.response?.data || err.message || err
                          );
                        } finally {
                          setEditAdvanceLoading(false);
                        }
                      }}
                    >
                      <Text style={styles.advanceRequestBtnText}>
                        {editAdvanceLoading ? "Updating..." : "Update Advance"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* === DELETE CONFIRMATION MODAL === */}
          <Modal
            visible={showDeleteConfirmation}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDeleteConfirmation(false)}
          >
            <TouchableWithoutFeedback
              onPress={() => setShowDeleteConfirmation(false)}
            >
              <View style={styles.loanModalBackdrop}>
                <TouchableWithoutFeedback>
                  <View style={styles.confirmationPopup}>
                    <Text style={styles.confirmationTitle}>
                      Delete Loan Request
                    </Text>
                    <Text style={styles.confirmationMessage}>
                      Are you sure you want to delete this loan request? This
                      action cannot be undone.
                    </Text>
                    <View style={styles.confirmationButtons}>
                      <TouchableOpacity
                        style={[styles.confirmationBtn, styles.cancelBtn]}
                        onPress={() => {
                          setShowDeleteConfirmation(false);
                          setSelectedLoanForDelete(null);
                        }}
                        disabled={deleteLoanLoading}
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.confirmationBtn,
                          styles.deleteConfirmBtn,
                        ]}
                        onPress={async () => {
                          if (!selectedLoanForDelete) return;
                          setDeleteLoanLoading(true);
                          try {
                            await deleteLoanRequest(
                              selectedLoanForDelete.reqId ||
                                selectedLoanForDelete.id
                            );

                            // Refresh data
                            refreshData();
                            setShowDeleteConfirmation(false);
                            setSelectedLoanForDelete(null);
                          } catch (err) {
                            console.log(
                              "Delete loan error",
                              err?.response?.data || err.message || err
                            );
                          } finally {
                            setDeleteLoanLoading(false);
                          }
                        }}
                        disabled={deleteLoanLoading}
                      >
                        <Text style={styles.deleteConfirmBtnText}>
                          {deleteLoanLoading ? "Deleting..." : "Delete"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* === DELETE ADVANCE CONFIRMATION MODAL === */}
          <Modal
            visible={showDeleteAdvanceConfirmation}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDeleteAdvanceConfirmation(false)}
          >
            <TouchableWithoutFeedback
              onPress={() => setShowDeleteAdvanceConfirmation(false)}
            >
              <View style={styles.loanModalBackdrop}>
                <TouchableWithoutFeedback>
                  <View style={styles.confirmationPopup}>
                    <Text style={styles.confirmationTitle}>
                      Delete Advance Request
                    </Text>
                    <Text style={styles.confirmationMessage}>
                      Are you sure you want to delete this advance request? This
                      action cannot be undone.
                    </Text>
                    <View style={styles.confirmationButtons}>
                      <TouchableOpacity
                        style={[styles.confirmationBtn, styles.cancelBtn]}
                        onPress={() => {
                          setShowDeleteAdvanceConfirmation(false);
                          setSelectedAdvanceForDelete(null);
                        }}
                        disabled={deleteAdvanceLoading}
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.confirmationBtn,
                          styles.deleteConfirmBtn,
                        ]}
                        onPress={async () => {
                          if (!selectedAdvanceForDelete) return;
                          setDeleteAdvanceLoading(true);
                          try {
                            await deleteAdvanceRequest(
                              selectedAdvanceForDelete.reqId ||
                                selectedAdvanceForDelete.id
                            );

                            // Refresh data
                            refreshData();
                            setShowDeleteAdvanceConfirmation(false);
                            setSelectedAdvanceForDelete(null);
                          } catch (err) {
                            console.log(
                              "Delete advance error",
                              err?.response?.data || err.message || err
                            );
                          } finally {
                            setDeleteAdvanceLoading(false);
                          }
                        }}
                        disabled={deleteAdvanceLoading}
                      >
                        <Text style={styles.deleteConfirmBtnText}>
                          {deleteAdvanceLoading ? "Deleting..." : "Delete"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* === COLLECT PAYMENT CARD === */}
          <View style={styles.collectCard}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Text style={styles.collectTitle}>Collect your Payment</Text>
              <Text style={styles.collectAmount}>Rs 50,000.00</Text>
            </View>
            <Text style={styles.collectDate}>Date : 25/06/25</Text>
            <TouchableOpacity
              style={styles.collectBtn}
              onPress={() => setShowSlideModal(true)}
            >
              <Text style={styles.collectBtnText}>Collect</Text>
            </TouchableOpacity>
          </View>

          {/* === LOAN CARD === */}
          <View style={styles.loanCard}>
            <Text style={styles.loanTitle}>Loan</Text>
            <Text style={styles.loanPending}>Pending amount to pay</Text>
            <Text style={styles.loanAmount}>
              Rs{" "}
              {displayLoan
                ? Number(
                    displayLoan.remainingAmount || displayLoan.amount || 0
                  ).toLocaleString()
                : "0.00"}
            </Text>
            <View style={styles.loanRow}>
              <Text style={styles.loanPending}>Monthly payment</Text>
              <Text style={styles.loanMonthAmount}>
                Rs{" "}
                {displayLoan
                  ? Number(
                      displayLoan.monthlyInstalment ||
                        displayLoan.amount / (displayLoan.months || 1)
                    ).toLocaleString(undefined, { minimumFractionDigits: 2 })
                  : "0.00"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.loanBtn}
              onPress={() => setShowLoanDetails(true)}
            >
              <Text style={styles.loanBtnText}>
                {displayLoan ? "View" : "Details"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{ marginTop: 22, marginLeft: 14 }}
            onPress={() => setShowHistory(true)}
          >
            <Text style={styles.historyText}>View Payment History</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* === PAYMENT TYPE SELECTOR MODAL === */}
      <Modal
        visible={showSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSelector(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSelector(false)}>
          <View style={styles.modalBgSel}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Select Payment method</Text>
                {["Cash", "Bank Transfer", "Check"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.modalOption}
                    onPress={() => {
                      setPaymentType(option);
                      setShowSelector(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* === LOAN DETAILS MODAL === */}
      <Modal
        visible={showLoanDetails}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLoanDetails(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowLoanDetails(false)}>
          <View style={styles.loanModalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.loanPopup}>
                <Text style={styles.loanPopupTitle}>Loan Details</Text>
                <View style={styles.loanPopupRow}>
                  <Text style={styles.loanPopupLabel}>Loan Amount:</Text>
                  <Text style={styles.loanPopupValue}>
                    Rs{" "}
                    {displayLoan
                      ? Number(
                          displayLoan.loanAmount || displayLoan.amount
                        ).toLocaleString()
                      : "-"}
                  </Text>
                </View>
                <View style={styles.loanPopupRow}>
                  <Text style={styles.loanPopupLabel}>
                    Monthly Installment:
                  </Text>
                  <Text style={styles.loanPopupValue}>
                    Rs{" "}
                    {displayLoan
                      ? Number(
                          displayLoan.monthlyInstalment ||
                            displayLoan.amount / (displayLoan.months || 1)
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })
                      : "-"}
                  </Text>
                </View>
                <View style={styles.loanPopupRow}>
                  <Text style={styles.loanPopupLabel}>Interest Rate:</Text>
                  <Text style={styles.loanPopupValue}>
                    {displayLoan?.rate ? `${displayLoan.rate}%` : "-"}
                  </Text>
                </View>
                <View style={styles.loanPopupRow}>
                  <Text style={styles.loanPopupLabel}>Amount Payable:</Text>
                  <Text style={styles.loanPopupValue}>
                    Rs{" "}
                    {displayLoan && displayLoan.remainingAmount
                      ? Number(displayLoan.remainingAmount).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                          }
                        )
                      : "-"}
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* === PAYMENT HISTORY MODAL (WITH DETAIL POPUP) === */}
      <Modal
        visible={showHistory}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!selectedPayment) setShowHistory(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBg}>
              <TouchableWithoutFeedback>
                <View style={styles.sheet}>
                  <TouchableOpacity
                    onPress={() => setShowHistory(false)}
                    style={styles.downArrowBtn}
                  >
                    <Ionicons name="chevron-down" size={28} color="#183d2b" />
                  </TouchableOpacity>
                  <Text style={styles.sheetTitle}>Payment History</Text>
                  <TextInput
                    style={styles.searchBar}
                    placeholder="Search Payment"
                    placeholderTextColor="#888"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    autoCorrect={false}
                  />
                  <View style={styles.filterContainer}>
                    <View style={styles.yearSelector}>
                      <TouchableOpacity
                        onPress={() => setSelectedYear(selectedYear - 1)}
                        style={styles.yearButton}
                      >
                        <Ionicons
                          name="chevron-back"
                          size={24}
                          color="#274C3C"
                        />
                      </TouchableOpacity>
                      <Text style={styles.yearText}>{selectedYear}</Text>
                      <TouchableOpacity
                        onPress={() => setSelectedYear(selectedYear + 1)}
                        style={styles.yearButton}
                      >
                        <Ionicons
                          name="chevron-forward"
                          size={24}
                          color="#274C3C"
                        />
                      </TouchableOpacity>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.monthScroll}
                    >
                      {months.map((month, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => setSelectedMonth(index)}
                          style={[
                            styles.monthButton,
                            selectedMonth === index && styles.selectedMonth,
                          ]}
                        >
                          <Text
                            style={[
                              styles.monthText,
                              selectedMonth === index &&
                                styles.selectedMonthText,
                            ]}
                          >
                            {month}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>
                      Payment Type
                    </Text>
                    <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>
                      Amount
                    </Text>
                  </View>
                  <FlatList
                    data={filteredPayments}
                    keyExtractor={(_, i) => String(i)}
                    keyboardShouldPersistTaps="handled"
                    style={{ maxHeight: 370, minHeight: 30 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.tableRow}
                        onPress={() => setSelectedPayment(item)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.cell, { flex: 1 }]}>
                          {item.paymentType}
                        </Text>
                        <Text style={[styles.cell, { flex: 1 }]}>
                          {money(item.amount)}
                        </Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                      <Text
                        style={{
                          color: "#999",
                          alignSelf: "center",
                          marginTop: 40,
                        }}
                      >
                        {loadingPayments ? "Loading..." : "No results found."}
                      </Text>
                    )}
                    contentContainerStyle={{}}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        {/* === PAYMENT DETAIL POPUP === */}
        <Modal
          visible={!!selectedPayment}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedPayment(null)}
        >
          <TouchableWithoutFeedback onPress={() => setSelectedPayment(null)}>
            <View style={styles.detailModalBg}>
              <TouchableWithoutFeedback>
                <View style={styles.detailPopup}>
                  <Text style={styles.detailTitle}>Payment Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailVal}>
                      {selectedPayment?.paymentType}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailVal}>
                      {selectedPayment?.paymentDate
                        ? new Date(
                            selectedPayment.paymentDate
                          ).toLocaleDateString("en-GB")
                        : ""}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount:</Text>
                    <Text style={styles.detailVal}>
                      Rs {money(selectedPayment?.amount || 0)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text
                      style={[
                        styles.detailVal,
                        selectedPayment?.status === "APPROVED"
                          ? styles.successStatus
                          : styles.pendingStatus,
                      ]}
                    >
                      {selectedPayment?.status}
                    </Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </Modal>

      {/* === SLIDE TO CONFIRM (COLLECTION) MODAL === */}
      <Modal
        visible={showSlideModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSlideModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSlideModal(false)}>
          <View style={styles.slideModalBg}>
            <TouchableWithoutFeedback>
              <View style={styles.slideModal}>
                <SlideToConfirm
                  unconfimredTipText="Slide to confirm Delivery"
                  confirmedTipText="Confirmed"
                  sliderStyle={{
                    width: 220,
                    height: 45,
                    borderRadius: 27,
                    backgroundColor: "#073229",
                    justifyContent: "center",
                  }}
                  unconfirmedTipTextStyle={{
                    color: "#fff",
                    fontSize: 15,
                    marginLeft: 14,
                  }}
                  confirmedTipTextStyle={{
                    color: "#fff",
                    fontSize: 15,
                    marginLeft: 14,
                  }}
                  thumbStyle={{
                    backgroundColor: "#f4f1ef",
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  thumbIcon={
                    <Ionicons name="chevron-forward" size={28} color="#222" />
                  }
                  onSlideConfirmed={() => {
                    setSlideConfirmed(true);
                    setTimeout(() => {
                      setShowSlideModal(false);
                      setSlideConfirmed(false);
                    }, 900);
                  }}
                  state={slideConfirmed}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center" },
  scrollContent: { alignItems: "center", paddingBottom: 100 },
  walletCard: {
    marginTop: 34,
    width: "92%",
    backgroundColor: "#d3e8e3",
    borderRadius: 18,
    padding: 23,
    alignItems: "center",
  },
  walletTitle: {
    fontSize: 21,
    fontWeight: "500",
    color: "#111",
    marginBottom: 9,
  },
  walletAmount: { fontSize: 28, color: "#195645", marginBottom: 5 },
  amountValue: {
    fontWeight: "bold",
    fontSize: 33,
    color: "#1c604d",
    letterSpacing: 1.2,
  },
  paymentType: {
    fontSize: 16,
    color: "#222",
    marginVertical: 7,
    marginBottom: 15,
  },
  walletBtnRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 8,
  },
  walletBtn: {
    backgroundColor: "#222",
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 22,
    marginHorizontal: 6,
    alignItems: "center",
    minWidth: 118,
  },
  walletBtnText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 19,
  },
  collectCard: {
    marginTop: 18,
    width: "92%",
    backgroundColor: "#eaf2ea",
    borderRadius: 14,
    padding: 18,
    alignItems: "flex-start",
    marginBottom: 10,
    elevation: 1,
  },
  collectTitle: { fontSize: 16, fontWeight: "600", color: "#183d2b" },
  collectAmount: { fontSize: 18, fontWeight: "700", color: "#165E52" },
  collectDate: { color: "#222", fontSize: 14, marginVertical: 6 },
  collectBtn: {
    backgroundColor: "#183d2b",
    marginTop: 9,
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 28,
    alignSelf: "flex-end",
    elevation: 2,
  },
  collectBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  loanCard: {
    width: "92%",
    backgroundColor: "#d3e8e3",
    borderRadius: 14,
    padding: 18,
    alignItems: "flex-start",
    marginBottom: 10,
    elevation: 1,
  },
  loanTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#183d2b",
    marginBottom: 3,
  },
  loanPending: { color: "#222", fontSize: 15 },
  loanAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#165E52",
    marginVertical: 2,
  },
  loanRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 6,
    marginBottom: 5,
  },
  loanMonthAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#183d2b",
    marginLeft: 18,
  },
  loanBtn: {
    backgroundColor: "#165E52",
    borderRadius: 17,
    paddingVertical: 8,
    paddingHorizontal: 28,
    alignSelf: "flex-end",
    elevation: 2,
  },
  loanBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  historyText: {
    fontSize: 16,
    color: "#183d2b",
    textDecorationLine: "underline",
    fontWeight: "bold",
  },

  modalBgSel: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: 265,
    backgroundColor: "#fff",
    borderRadius: 13,
    padding: 19,
    elevation: 8,
    alignItems: "flex-start",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 17.5,
    marginBottom: 15,
    color: "#111",
  },
  modalOption: { paddingVertical: 6, width: "100%" },
  modalOptionText: { fontSize: 17, color: "#222" },

  loanModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  loanPopup: {
    width: 310,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 22,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  loanPopupTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#183d2b",
    marginBottom: 16,
    alignSelf: "center",
  },
  loanPopupRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  loanPopupLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  loanPopupValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#165E52",
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.12)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 5,
    paddingBottom: 15,
    minHeight: 470,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -4 },
  },
  downArrowBtn: { alignItems: "center", marginVertical: 0, marginBottom: 6 },
  sheetTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: "#222",
    alignSelf: "center",
    marginBottom: 6,
    marginTop: 2,
  },
  searchBar: {
    backgroundColor: "#eaf2ea",
    borderRadius: 18,
    fontSize: 17,
    color: "#222",
    paddingVertical: 6,
    paddingLeft: 16,
    width: "98%",
    marginBottom: 8,
    alignSelf: "center",
  },
  tableHeader: {
    borderBottomColor: "#c3dac3",
    borderBottomWidth: 1.4,
    paddingBottom: 6,
    backgroundColor: "#d3e8e3",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    marginTop: 6,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#c3dac3",
    borderBottomWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 2,
    backgroundColor: "#fff",
  },
  cell: {
    fontSize: 15,
    color: "#232",
    textAlign: "center",
    paddingHorizontal: 1,
  },
  headerCell: {
    fontWeight: "600",
    fontSize: 15,
    color: "#183d2b",
  },
  pendingStatus: { color: "#f18b1b", fontWeight: "700" },
  successStatus: { color: "#228c22", fontWeight: "700" },
  detailModalBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.14)",
  },
  detailPopup: {
    width: 315,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 28,
    alignItems: "flex-start",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.19,
    shadowOffset: { width: 0, height: 2 },
  },
  detailTitle: {
    fontWeight: "bold",
    fontSize: 19,
    color: "#222",
    marginBottom: 20,
    alignSelf: "center",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 4,
  },
  detailLabel: { fontSize: 16, fontWeight: "600", color: "#333", minWidth: 70 },
  detailVal: { fontSize: 16, fontWeight: "500", color: "#165E52" },
  slideModalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.10)",
    justifyContent: "center",
    alignItems: "center",
  },
  slideModal: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  advancePopup: {
    width: 310,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 22,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  advanceLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 14,
    marginBottom: 6,
    color: "#183d2b",
  },
  advanceInput: {
    backgroundColor: "#eaf2ea",
    borderRadius: 6,
    fontSize: 16,
    color: "#222",
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  advanceDropdown: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  advanceDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#ecf3ef",
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  advanceDropdownItemSelected: {
    backgroundColor: "#165E52",
  },
  advanceDropdownText: {
    color: "#165E52",
    fontWeight: "600",
  },
  advanceDropdownTextSelected: {
    color: "#fff",
  },
  advanceErrorText: {
    color: "#B3292A",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 6,
    fontWeight: "600",
  },
  advanceRequestBtn: {
    backgroundColor: "#165E52",
    marginTop: 20,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  advanceRequestBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  loanActionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 10,
  },
  loanActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  editBtn: {
    backgroundColor: "#165E52",
  },
  deleteBtn: {
    backgroundColor: "#B3292A",
  },
  loanActionBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  confirmationPopup: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#183d2b",
    marginBottom: 12,
  },
  confirmationMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  confirmationButtons: {
    flexDirection: "row",
    gap: 12,
  },
  confirmationBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#ecf3ef",
  },
  cancelBtnText: {
    color: "#165E52",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteConfirmBtn: {
    backgroundColor: "#B3292A",
  },
  deleteConfirmBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  filterContainer: {
    marginBottom: 20,
  },
  yearSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  yearButton: {
    padding: 10,
  },
  yearText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#274C3C",
    marginHorizontal: 20,
  },
  monthScroll: {
    marginHorizontal: 20,
  },
  monthButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#E7EDEB",
  },
  selectedMonth: {
    backgroundColor: "#274C3C",
  },
  monthText: {
    fontSize: 16,
    color: "#274C3C",
  },
  selectedMonthText: {
    color: "#fff",
  },
});
