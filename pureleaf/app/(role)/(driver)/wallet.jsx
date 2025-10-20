import React, { useState, useMemo, useEffect } from "react";
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
  Dimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import SlideToConfirm from "rn-slide-to-confirm";

const mockPayments = [
  { id: "001", date: "01/06/25", amount: 10000, status: "Pending", description: "Payment pending approval" },
  { id: "002", date: "02/06/25", amount: 12000, status: "Success", description: "Paid to supplier" },
  { id: "003", date: "03/06/25", amount: 11000, status: "Pending", description: "Payment pending approval" },
  { id: "004", date: "04/06/25", amount: 15000, status: "Success", description: "Paid to supplier" },
];
const statusSort = { Pending: 0, Success: 1 };

export default function WalletPage() {
  // 👇 All necessary state hooks are defined properly INSIDE the component now

  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceType, setAdvanceType] = useState("");
  const [advanceError, setAdvanceError] = useState("");
  const [advanceCards, setAdvanceCards] = useState([]);

  // history sheet removed — displaying inline history table
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentType, setPaymentType] = useState("Cash");
  const [showSelector, setShowSelector] = useState(false);
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [slideConfirmed, setSlideConfirmed] = useState(false);
  const [showLoanDetails, setShowLoanDetails] = useState(false);
  const [collectAmount, setCollectAmount] = useState(50000);
  const [collectDate, setCollectDate] = useState('25/06/25');
  const screenWidth = Dimensions.get('window').width;
  const sliderWidth = Math.round(screenWidth * 0.9);
  const sliderHeight = 64;
  const thumbSize = sliderHeight; // thumb circle equals slider height
  const thumbIconSize = Math.round(thumbSize * 0.56);

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
        if (statusSort[a.status] !== statusSort[b.status]) return statusSort[a.status] - statusSort[b.status];
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.id.localeCompare(a.id);
      });
  }, [searchTerm]);

  const money = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2 });

  // openCollect param handling
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params?.openCollect === 'true' || params?.openCollect === true) {
      setShowSlideModal(true);
      // remove the query param so it doesn't reopen on revisit
      try { router.replace('/(role)/(driver)/wallet'); } catch (e) {}
    }
  }, [params]);

  // no persisted flag: always show collect card

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* === WALLET CARD === */}
          <View style={styles.walletCard}>
            <Text style={styles.walletTitle}>My Wallet</Text>
            <Text style={styles.walletAmount}>
              <Text style={{ fontWeight: "bold" }}>Rs </Text>
              <Text style={styles.amountValue}>50,000.00</Text>
            </Text>
            <TouchableOpacity onPress={() => setShowSelector(true)} activeOpacity={0.8}>
              <Text style={styles.paymentType}>
                Payment type : <Text style={{ fontWeight: "600" }}>{paymentType}</Text>
              </Text>
            </TouchableOpacity>
            

            </View>






          {/* === COLLECT PAYMENT CARD === */}
          <TouchableOpacity style={styles.collectCard} onPress={() => setShowSlideModal(true)} activeOpacity={0.85}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
              <Text style={styles.collectTitle}>Collect your Payment</Text>
              <Text style={styles.collectAmount}>Rs 50,000.00</Text>
            </View>
            <Text style={styles.collectDate}>Date : 25/06/25</Text>
            {/* entire card is clickable — removed inner Collect button */}
          </TouchableOpacity>

          

          {/* history sheet removed — inline table below */}
          {/* Inline Payment History table (visible on page) */}
          <View style={{ width: '94%', marginTop: 16, marginBottom: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#183d2b', marginBottom: 8 }}>Payment History</Text>
            <TextInput
              style={[styles.searchBar, { width: '100%' }]}
              placeholder="Search Payment"
              placeholderTextColor="#888"
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoCorrect={false}
            />
            <View style={[styles.tableRow, styles.tableHeader, { marginTop: 8 }]}>
              <Text style={[styles.cell, styles.headerCell, { flex: 0.9 }]}>Payment ID</Text>
              <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Date</Text>
              <Text style={[styles.cell, styles.headerCell, { flex: 1.1 }]}>Total(Rs)</Text>
              <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Status</Text>
            </View>
            <FlatList
              data={filteredPayments}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 260, minHeight: 40, backgroundColor: '#fff' }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.tableRow} onPress={() => setSelectedPayment(item)} activeOpacity={0.8}>
                  <Text style={[styles.cell, { flex: 0.9 }]}>{item.id}</Text>
                  <Text style={[styles.cell, { flex: 1 }]}>{item.date}</Text>
                  <Text style={[styles.cell, { flex: 1.1 }]}>{money(item.amount)}</Text>
                  <Text style={[styles.cell, { flex: 1 }, item.status === 'Pending' ? styles.pendingStatus : styles.successStatus]}>{item.status}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <Text style={{ color: '#999', alignSelf: 'center', marginTop: 18 }}>No payments yet.</Text>
              )}
            />
          </View>
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

      {/* === PAYMENT DETAIL POPUP (top-level) === */}
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
                  <Text style={styles.detailVal}>{selectedPayment?.date}</Text>
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount: </Text>
                  <Text style={styles.detailVal}>Rs {money(selectedPayment?.amount || 0)}</Text>
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status: </Text>
                  <Text style={[
                    styles.detailVal,
                    selectedPayment?.status === "Pending"
                      ? styles.pendingStatus
                      : styles.successStatus,
                  ]}>
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

      

  {/* history sheet removed — using inline table on page */}


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
                <View style={{ width: '100%', marginBottom: 14 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#183d2b', alignSelf: 'center' }}>Collect Payment</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                    <Text style={{ fontSize: 16, color: '#222' }}>Amount</Text>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#165E52' }}>Rs {money(collectAmount)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                    <Text style={{ fontSize: 15, color: '#666' }}>Date</Text>
                    <Text style={{ fontSize: 15, color: '#666' }}>{collectDate}</Text>
                  </View>
                </View>
                <SlideToConfirm
                  unconfimredTipText="Slide to collect payment"
                  confirmedTipText="Confirmed"
                  sliderStyle={{
                    width: sliderWidth,
                    height: sliderHeight,
                    borderRadius: Math.round(sliderHeight / 2),
                    backgroundColor: "#073229",
                    justifyContent: "center",
                    paddingVertical: 0,
                    paddingHorizontal: 0,
                  }}
                  unconfirmedTipTextStyle={{
                    color: "#fff",
                    fontSize: 17,
                    marginLeft: Math.round(thumbSize / 2) + 6,
                    lineHeight: sliderHeight - 12,
                  }}
                  confirmedTipTextStyle={{
                    color: "#fff",
                    fontSize: 17,
                    marginLeft: Math.round(thumbSize / 2) + 6,
                    lineHeight: sliderHeight - 12,
                  }}
                  thumbStyle={{
                    backgroundColor: "#fff",
                    width: thumbSize,
                    height: thumbSize,
                    borderRadius: Math.round(thumbSize / 2),
                    alignItems: "center",
                    justifyContent: "center",
                    margin: 0,
                    padding: 0,
                  }}
                  thumbIcon={
                    <Ionicons name="chevron-forward" size={thumbIconSize} color="#222" />
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
  walletTitle: { fontSize: 21, fontWeight: "500", color: "#111", marginBottom: 9 },
  walletAmount: { fontSize: 28, color: "#195645", marginBottom: 5 },
  amountValue: { fontWeight: "bold", fontSize: 33, color: "#1c604d", letterSpacing: 1.2 },
  paymentType: { fontSize: 16, color: "#222", marginVertical: 7, marginBottom: 15 },
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
  loanTitle: { fontSize: 17, fontWeight: "700", color: "#183d2b", marginBottom: 3 },
  loanPending: { color: "#222", fontSize: 15 },
  loanAmount: { fontSize: 22, fontWeight: "bold", color: "#165E52", marginVertical: 2 },
  loanRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 6,
    marginBottom: 5,
  },
  loanMonthAmount: { fontSize: 16, fontWeight: "600", color: "#183d2b", marginLeft: 18 },
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
    shadowOpacity: 0.10,
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
  justifyContent: "flex-end",
  alignItems: "stretch",
  },
  slideModal: {
  backgroundColor: "#fff",
  borderTopLeftRadius: 18,
  borderTopRightRadius: 18,
  paddingTop: 18,
  paddingHorizontal: 18,
  paddingBottom: Platform.OS === 'ios' ? 54 : 34,
  marginBottom: 8,
  alignItems: "center",
  justifyContent: "center",
  width: '100%'
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
  scrollContent: {
  alignItems: "center",
  paddingBottom: 90, 

},

});
