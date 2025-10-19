import React, { useState, useMemo, useCallback } from "react";
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
} from "../../../services/supplierService";
import { usePullToRefresh } from "../../../hooks/usePullToRefresh";

const mockPayments = [
  {
    id: "001",
    date: "01/06/25",
    amount: 10000,
    status: "Pending",
    description: "Payment pending approval",
  },
  {
    id: "002",
    date: "02/06/25",
    amount: 12000,
    status: "Success",
    description: "Paid to supplier",
  },
  {
    id: "003",
    date: "03/06/25",
    amount: 11000,
    status: "Pending",
    description: "Payment pending approval",
  },
  {
    id: "004",
    date: "04/06/25",
    amount: 15000,
    status: "Success",
    description: "Paid to supplier",
  },
];
const statusSort = { Pending: 0, Success: 1 };

export default function WalletPage() {
  // 👇 All necessary state hooks are defined properly INSIDE the component now

  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceType, setAdvanceType] = useState("");
  const [advancePurpose, setAdvancePurpose] = useState("");
  const [advanceError, setAdvanceError] = useState("");
  const [advanceCards, setAdvanceCards] = useState([]);
  const [existingAdvances, setExistingAdvances] = useState([]);
  const [advanceLoading, setAdvanceLoading] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentType, setPaymentType] = useState("Cash");
  const [showSelector, setShowSelector] = useState(false);
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [slideConfirmed, setSlideConfirmed] = useState(false);
  const [showLoanDetails, setShowLoanDetails] = useState(false);

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
      if (supplierId) {
        const response = await getAdvanceRequests(supplierId);
        console.log("Advance requests response:", response.data); // Debug log
        setExistingAdvances(response.data);
      }
    } catch (_error) {
      // Silently fail for existing advances
    }
  }, []);

  const { refreshing, onRefresh } = usePullToRefresh(refreshData);

  const filteredPayments = useMemo(() => {
    return mockPayments
      .filter((p) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return (
          p.id.toLowerCase().includes(term) ||
          p.date.toLowerCase().includes(term) ||
          p.status.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        if (statusSort[a.status] !== statusSort[b.status])
          return statusSort[a.status] - statusSort[b.status];
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.id.localeCompare(a.id);
      });
  }, [searchTerm]);

  const money = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2 });

  // Fetch existing advances when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchExistingAdvances = async () => {
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
          if (supplierId) {
            const response = await getAdvanceRequests(supplierId);
            console.log("Advance requests response:", response.data); // Debug log
            setExistingAdvances(response.data);
          }
        } catch (_error) {
          // Silently fail for existing advances
        }
      };
      fetchExistingAdvances();
    }, [])
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
            <Text style={styles.walletTitle}>My Wallet</Text>
            <Text style={styles.walletAmount}>
              <Text style={{ fontWeight: "bold" }}>Rs </Text>
              <Text style={styles.amountValue}>50,000.00</Text>
            </Text>
            <Text style={styles.paymentType}>
              Payment type :{" "}
              <Text style={{ fontWeight: "600" }}>{paymentType}</Text>
            </Text>
            <View style={styles.walletBtnRow}>
              <TouchableOpacity
                style={styles.walletBtn}
                onPress={() => setShowSelector(true)}
              >
                <Text style={styles.walletBtnText}>
                  Change{"\n"}Payment type
                </Text>
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
          {[...existingAdvances, ...advanceCards].map((item, index) => (
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
                  {Number(item.requestedAmount || item.amount).toLocaleString()}
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
                <Text style={styles.collectDate}>Purpose : {item.purpose}</Text>
              )}
              {item.status === "REJECTED" && item.rejectionReason && (
                <Text style={[styles.collectDate, { color: "#B3292A" }]}>
                  Rejection Reason : {item.rejectionReason}
                </Text>
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
                          const data = response.data;
                          setAdvanceCards((prev) => [...prev, data]);
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
            <Text style={styles.loanAmount}>Rs 50,000.00</Text>
            <View style={styles.loanRow}>
              <Text style={styles.loanPending}>Monthly payment</Text>
              <Text style={styles.loanMonthAmount}>Rs 18,000.00</Text>
            </View>
            <TouchableOpacity
              style={styles.loanBtn}
              onPress={() => setShowLoanDetails(true)}
            >
              <Text style={styles.loanBtnText}>View</Text>
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
                  <Text style={styles.loanPopupValue}>Rs 50,000.00</Text>
                </View>
                <View style={styles.loanPopupRow}>
                  <Text style={styles.loanPopupLabel}>
                    Monthly Installment:
                  </Text>
                  <Text style={styles.loanPopupValue}>Rs 18,000.00</Text>
                </View>
                <View style={styles.loanPopupRow}>
                  <Text style={styles.loanPopupLabel}>Interest Rate:</Text>
                  <Text style={styles.loanPopupValue}>12%</Text>
                </View>
                <View style={styles.loanPopupRow}>
                  <Text style={styles.loanPopupLabel}>Amount Payable:</Text>
                  <Text style={styles.loanPopupValue}>Rs 54,000.00</Text>
                </View>
                <View style={styles.loanPopupRow}>
                  <Text style={styles.loanPopupLabel}>Payment Type:</Text>
                  <Text style={styles.loanPopupValue}>{paymentType}</Text>
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
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text
                      style={[styles.cell, styles.headerCell, { flex: 0.9 }]}
                    >
                      Payment ID
                    </Text>
                    <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>
                      Date
                    </Text>
                    <Text
                      style={[styles.cell, styles.headerCell, { flex: 1.1 }]}
                    >
                      Total(Rs)
                    </Text>
                    <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>
                      Status
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
                        <Text style={[styles.cell, { flex: 0.9 }]}>
                          {item.id}
                        </Text>
                        <Text style={[styles.cell, { flex: 1 }]}>
                          {item.date}
                        </Text>
                        <Text style={[styles.cell, { flex: 1.1 }]}>
                          {money(item.amount)}
                        </Text>
                        <Text
                          style={[
                            styles.cell,
                            { flex: 1 },
                            item.status === "Pending"
                              ? styles.pendingStatus
                              : styles.successStatus,
                          ]}
                        >
                          {item.status}
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
                        No results found.
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
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Payment ID: </Text>
                    <Text style={styles.detailVal}>{selectedPayment?.id}</Text>
                  </Text>
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date: </Text>
                    <Text style={styles.detailVal}>
                      {selectedPayment?.date}
                    </Text>
                  </Text>
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount: </Text>
                    <Text style={styles.detailVal}>
                      Rs {money(selectedPayment?.amount || 0)}
                    </Text>
                  </Text>
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status: </Text>
                    <Text
                      style={[
                        styles.detailVal,
                        selectedPayment?.status === "Pending"
                          ? styles.pendingStatus
                          : styles.successStatus,
                      ]}
                    >
                      {selectedPayment?.status}
                    </Text>
                  </Text>
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Description: </Text>
                    <Text style={styles.detailVal}>
                      {selectedPayment?.description || "-"}
                    </Text>
                  </Text>
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
    textAlign: "left",
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
    padding: 22,
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
    marginBottom: 12,
    alignSelf: "center",
  },
  detailRow: { fontSize: 15.5, marginBottom: 7, color: "#333" },
  detailLabel: { fontWeight: "600" },
  detailVal: { fontWeight: "400" },
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
});
