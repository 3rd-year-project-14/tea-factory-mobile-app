import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";

const reasons = ["Fever", "Rain", "No Leaves", "Personal", "Other"];

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
  const [userName, setUserName] = useState("");
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem("userData");
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          setUserName(userData.name || "");
        }
      } catch {
        setUserName("");
      }
    };
    loadUserName();
  }, []);
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [pageState, setPageState] = useState("main");
  const [notCollectingReason, setNotCollectingReason] = useState("");
  const [dropdownValue, setDropdownValue] = useState("");
  const [afterFour, setAfterFour] = useState(false);
  const [supplierModalVisible, setSupplierModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [readySimulated, setReadySimulated] = useState(false);
  const [showStartTrip, setShowStartTrip] = useState(false);

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const router = useRouter();

  const handleCheckIn = () => setModalVisible(true);
  const handleYesCollecting = () => {
    setModalVisible(false);
    setPageState("checkedIn");
  };
  const handleNoCollecting = () => {
    setModalVisible(false);
    setTimeout(() => setPickerModalVisible(true), 200);
  };
  const handleSubmitReason = () => {
    setNotCollectingReason(dropdownValue);
    setPickerModalVisible(false);
    setPageState("notCollectingSet");
  };
  const handleEditCheckedIn = () => setModalVisible(true);
  const handleEditNotCollecting = () => setPickerModalVisible(true);
  const handlePickerModalClose = () => {
    setPickerModalVisible(false);
    setPageState("checkedIn");
  };
  const handleShowSuppliers = () => setSupplierModalVisible(true);
  const handleSelectSupplier = (supplier) => setSelectedSupplier(supplier);
  const handleBackToList = () => setSelectedSupplier(null);

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f8f4" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
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
        {/* Collect your Cash Card */}
        <View style={styles.cashCard}>
          <View>
            <Text style={styles.cashCardLabel}>Collect your Cash</Text>
            <Text style={styles.cashCardDate}>Date : 25/06/25</Text>
          </View>
          <Text style={styles.cashCardValue}>Rs 50,000.00</Text>
        </View>
        {/* This month's Supply Card */}
        <View style={styles.supplyCard}>
          <Text style={styles.supplyCardLabel}>This month’s Supply</Text>
          <Text style={styles.supplyCardDate}>As at : 25/06/25</Text>
          <Text style={styles.supplyCardValue}>
            1000.5 <Text style={styles.supplyCardUnit}>kg</Text>
          </Text>
        </View>
        {/* Wallet Card */}
        <View style={styles.supplyCard}>
          <Text style={styles.supplyCardLabel}>Wallet</Text>
          <Text style={styles.walletCardValue}>
            Rs <Text style={styles.walletCardValueNum}>50,000.00</Text>
          </Text>
        </View>

        {/* Check In Button (only show if not checked in or not collecting, and before 4) */}
        {pageState === "main" && !afterFour && (
          <TouchableOpacity style={styles.checkInBtn} onPress={handleCheckIn}>
            <Text style={styles.checkInText}>Check In</Text>
          </TouchableOpacity>
        )}

        {pageState === "checkedIn" && !afterFour && (
          <TouchableOpacity onPress={() => setAfterFour(true)}>
            <Text style={styles.simBtnText}>Simulate After 4:00 PM</Text>
          </TouchableOpacity>
        )}

        {/* Checked In Card */}
        {pageState === "checkedIn" && !afterFour && (
          <TouchableOpacity
            style={styles.checkedInCard}
            onPress={handleEditCheckedIn}
          >
            <Text style={styles.checkedInTitle}>Checked In</Text>
            <Text style={styles.editHint}>Tap to edit</Text>
          </TouchableOpacity>
        )}

        {/* Not Collecting Card */}
        {pageState === "notCollectingSet" && !afterFour && (
          <TouchableOpacity
            style={styles.notCollectingCard}
            onPress={handleEditNotCollecting}
          >
            <Text style={styles.notCollectingTitle}>
              I'm not collecting today
            </Text>
            <Text style={styles.notCollectingReason}>
              Reason: {notCollectingReason}
            </Text>
            <Text style={styles.editHint}>Tap to edit</Text>
          </TouchableOpacity>
        )}

        {/* After-4 Supplier Count Card with Simulate Ready and Start Trip */}
        {afterFour && (
          <>
            <View style={styles.supplierCountCard}>
              <Text style={styles.supplierCountTitle}>
                Today's Total Suppliers
              </Text>
              <Text style={styles.supplierCountNum}>
                {suppliers.length}{" "}
                <Text style={styles.supplierCountUnit}>Suppliers</Text>
              </Text>
              <Text style={styles.supplierCountHint}>Tap to view details</Text>

              {/* Simulate Ready Button */}
              {!readySimulated && (
                <TouchableOpacity onPress={() => setReadySimulated(true)}>
                  <Text style={styles.simulateReadyBtnText}>
                    Simulate Ready
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {/* Start Trip Button */}
            {readySimulated && !showStartTrip && (
              <TouchableOpacity
                style={styles.startTripBtn}
                onPress={() => router.push("/(role)/(driver)/(nontabs)/trip")}
              >
                <Text style={styles.startTripBtnText}>Start Trip</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
      {/* ...rest of your modals and code... */}
      {/* (No changes below this line) */}
      {/* First Modal: Are you collecting today? */}
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
                style={styles.modalBtnYes}
                onPress={handleYesCollecting}
              >
                <Text style={styles.modalBtnText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnNo}
                onPress={handleNoCollecting}
              >
                <Text style={styles.modalBtnText}>No</Text>
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
            <Picker
              selectedValue={dropdownValue}
              style={styles.picker}
              itemStyle={{ color: "#183d2b", fontSize: 24 }}
              onValueChange={(itemValue) => setDropdownValue(itemValue)}
            >
              <Picker.Item label="Select reason..." value="" color="#888" />
              {reasons.map((r) => (
                <Picker.Item key={r} label={r} value={r} color="#183d2b" />
              ))}
            </Picker>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalBtnNo}
                onPress={handlePickerModalClose}
              >
                <Text style={styles.modalBtnText}>I'm Collecting</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnYes}
                disabled={!dropdownValue}
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
    marginTop: 18,
    marginHorizontal: 18,
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
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
    fontSize: 18,
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
    maxHeight: "80%",
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
    marginLeft: 15,
  },
  modalBtnNo: {
    backgroundColor: "#a11a1a",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginRight: 15,
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
