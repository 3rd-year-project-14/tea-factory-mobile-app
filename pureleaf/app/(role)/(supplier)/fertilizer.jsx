import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SlideToConfirm from "rn-slide-to-confirm";
import { usePullToRefresh } from "../../../hooks/usePullToRefresh";
import apiClient from "../../../services/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSupplierFertilizerRequest } from "../../../services/supplierService";

// fertilizerTypes will be loaded from backend (FertilizerStockDisplayDTO)
const defaultImage1 = require("../../../assets/images/fert1.jpg");
const defaultImage2 = require("../../../assets/images/fert2.jpg");
const defaultImage3 = require("../../../assets/images/fert3.jpg");

function getImageForProduct(name) {
  if (!name) return defaultImage1;
  const n = name.toLowerCase();
  if (n.includes("urea")) return defaultImage1;
  if (n.includes("ammonium")) return defaultImage2;
  // For other fertilizers, pick one of the three images to add visual variety
  const choices = [defaultImage1, defaultImage2, defaultImage3];
  // Use a deterministic but varied selection based on name hash to avoid changing on every render
  let hash = 0;
  for (let i = 0; i < n.length; i++) {
    hash = (hash << 5) - hash + n.charCodeAt(i);
    hash |= 0; // convert to 32bit integer
  }
  const idx = Math.abs(hash) % choices.length;
  return choices[idx];
}

export default function FertilizerPage() {
  const infoSheetRef = useRef();
  const requestSheetRef = useRef();
  const selectionSheetRef = useRef();
  const [selectedInfoFertilizer, setSelectedInfoFertilizer] = useState(null);

  const [fertilizerState, setFertilizerState] = useState("none"); // 'none', 'placed', 'driver', 'pending'
  const [cartItems, setCartItems] = useState([]);
  const [fertilizerTypes, setFertilizerTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // selectionMode: 'create' when making a new request, 'edit' when editing an existing request
  const [selectionMode, setSelectionMode] = useState("create");
  // working cart that is edited inside the selection popup; changes are committed to cartItems only when user confirms
  const [workingCart, setWorkingCart] = useState([]);

  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [placing, setPlacing] = useState(false);

  const refreshData = async () => {
    await fetchFertilizerTypes();
  };

  const { refreshing, onRefresh } = usePullToRefresh(refreshData);

  const fetchFertilizerTypes = async (supplierId = null) => {
    try {
      setError(null);
      setLoading(true);
      const params = {};
      if (supplierId) params.supplierId = supplierId;
      const resp = await apiClient.get("/api/fertilizer-stocks/display", {
        params,
      });
      // Expected DTO: { fertilizerStockId, productName, weightPerQuantity, sellPrice }
      const data = Array.isArray(resp.data) ? resp.data : [];
      // Map to local shape used by UI (id, name, price, unit)
      const choices = [defaultImage1, defaultImage2, defaultImage3];
      const mapped = data.map((d, idx) => {
        const name = d.productName || '';
        const n = String(name).toLowerCase();
        let image = choices[idx % choices.length];
        // keep deterministic images for known keywords
        if (n.includes('urea')) image = defaultImage1;
        else if (n.includes('ammonium')) image = defaultImage2;
        return {
          id: d.fertilizerStockId,
          name: d.productName,
          image,
          price: d.sellPrice ?? 0,
          unit: d.weightPerQuantity ? `${d.weightPerQuantity}kg` : "",
        };
      });
      setFertilizerTypes(mapped);
    } catch (err) {
      console.error("Failed to fetch fertilizer types", err);
      setError("Failed to load fertilizers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFertilizerTypes();
  }, []);
  // Open the request modal
  const openRequestModal = () => {
    requestSheetRef.current.open();
  };

  // Open the selection modal
  const openSelectionModal = (mode = "create") => {
    setSelectionMode(mode);
    if (mode === "edit") {
      // copy current cart into working cart for edit
      setWorkingCart(cartItems.map((c) => ({ ...c })));
    } else {
      setWorkingCart([]);
    }
    selectionSheetRef.current.open();
  };

  // Working-cart operations (used inside selection sheet). These don't mutate the live request until committed.
  const addToWorkingCart = (item, qty) => {
    if (!qty || qty <= 0) return;
    setWorkingCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? { ...p, qty: p.qty + qty, total: (p.qty + qty) * p.price }
            : p
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          unit: item.unit,
          price: item.price,
          qty,
          total: qty * item.price,
        },
      ];
    });
  };

  const updateWorkingQty = (id, newQty) => {
    setWorkingCart((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, qty: newQty, total: newQty * p.price } : p
        )
        .filter((p) => p.qty > 0)
    );
  };

  // Commit working cart to live cart. If creating, mark request placed. If editing, only replace cartItems.
  const commitWorkingCart = async () => {
    if (workingCart.length === 0) {
      Alert.alert("No items", "Please add fertilizers to your request.");
      return;
    }
    // Build DTO
    let supplierId = null;
    try {
      const supplierDataStr = await AsyncStorage.getItem('supplierData');
      if (supplierDataStr) {
        try {
          const supplierData = JSON.parse(supplierDataStr);
          if (Array.isArray(supplierData) && supplierData.length > 0) {
            supplierId = supplierData[0].supplierId;
          } else if (supplierData && supplierData.supplierId) {
            supplierId = supplierData.supplierId;
          }
        } catch (e) {
          supplierId = null;
        }
      }
    } catch (e) {
      supplierId = null;
    }
    if (!supplierId) {
      Alert.alert('Missing supplier', 'Cannot determine supplier ID.');
      return;
    }

    const dto = {
      supplierId,
      requestDate: new Date().toISOString().slice(0, 10),
      note: 'Requesting fertilizer',
      items: workingCart.map(w => ({ fertilizerStockId: w.id, quantity: Number(w.qty) })),
    };

    setPlacing(true);
    try {
      const resp = await createSupplierFertilizerRequest(dto);
      // Assume success if no exception; update UI
      setCartItems(workingCart.map(c => ({ ...c })));
      if (selectionMode === 'create') {
        setFertilizerState('placed');
      }
      selectionSheetRef.current.close();
      Alert.alert('Success', 'Fertilizer request placed successfully');
    } catch (err) {
      console.error('Failed to place fertilizer request', err);
      Alert.alert('Error', 'Failed to place fertilizer request. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 90 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Fertilizers</Text>

        {/* Fertilizer Types Slider (MAIN PAGE) */}
        <View style={styles.sliderRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {loading ? (
              <View
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="small" color="#183d2b" />
              </View>
            ) : error ? (
              <View style={{ padding: 12 }}>
                <Text style={{ color: "#900" }}>{error}</Text>
              </View>
            ) : (
              fertilizerTypes.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.fertilizerCard}
                onPress={() => {
                  setSelectedInfoFertilizer(item);
                  infoSheetRef.current.open();
                }}
              >
                {/* cycle images by index: 0->fert1,1->fert2,2->fert3,3->fert1... */}
                <Image source={[defaultImage1, defaultImage2, defaultImage3][idx % 3]} style={styles.fertilizerImage} />
                <View style={styles.fertilizerLabelOverlay}>
                  <Text style={styles.fertilizerLabelOverlayText}>
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Fertilizer Usage Card */}
        <View style={styles.usageCard}>
          <View style={styles.usageHeader}>
            <Text style={styles.usageTitle}>Fertilizer Usage</Text>
            <TouchableOpacity>
              <Ionicons name="settings-outline" size={22} color="#222" />
            </TouchableOpacity>
          </View>
          <Text style={styles.costLabel}>Cost :</Text>
          <Text style={styles.costValue}>
            <Text style={styles.costRs}>Rs </Text>
            10,000.00
          </Text>
          <Text style={styles.dateLabel}>From : 01/05/25</Text>
          <Text style={styles.dateLabel}>To : 01/06/25</Text>

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => router.replace("/usage")}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>

        {/* Request Placed Card */}
        {fertilizerState !== "none" && (
          <TouchableOpacity
            style={styles.requestPlacedCard}
            onPress={openRequestModal}
          >
            <Text style={styles.reqCardLabel}>Fertilizer request placed</Text>
            <Text style={[styles.reqCardDate, fertilizerState === 'rejected' ? styles.reqCardDateRejected : null]}>
              {fertilizerState === 'placed' && 'Tap to view or cancel'}
              {fertilizerState === 'driver' && 'Driver on the way'}
              {fertilizerState === 'pending' && 'Delivery confirmation pending'}
              {fertilizerState === 'rejected' && 'Request rejected'}
            </Text>
            {/* Small cart preview */}
            <View
              style={{
                backgroundColor: "#fff",
                padding: 8,
                borderRadius: 8,
                marginTop: 10,
              }}
            >
              {cartItems.slice(0, 3).map((c, i) => (
                <View
                  key={c.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ color: "#222" }}>
                    {String(i + 1).padStart(2, "0")} {c.name}
                  </Text>
                  <Text style={{ color: "#222" }}>
                    {c.qty} x {c.unit}
                  </Text>
                </View>
              ))}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 6,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Sub Total</Text>
                <Text style={{ fontWeight: "700" }}>
                  Rs. {cartItems.reduce((s, i) => s + i.total, 0).toFixed(2)}
                </Text>
              </View>
            </View>
            {fertilizerState === "driver" && (
              <Text style={styles.reqCardDate}>
                Arriving at <Text style={{ fontWeight: "bold" }}>5:45PM</Text>
              </Text>
            )}
            {fertilizerState === "pending" && (
              <Text style={styles.reqCardDate}>Collect your Fertilizers</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Request Fertilizer Button & Next Button */}
        {fertilizerState === "none" && (
          <>
            <TouchableOpacity
              style={styles.requestButton}
              onPress={() => {
                openSelectionModal();
              }}
            >
              <Text style={styles.requestButtonText}>Request Fertilizer</Text>
            </TouchableOpacity>
            {/* Next Button removed per request */}
          </>
        )}
      </ScrollView>

      {/* Fertilizer Info Bottom Sheet (shows correct fertilizer details) */}
      <RBSheet
        ref={infoSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.4)" },
          draggableIcon: { backgroundColor: "#bbb" },
          container: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            minHeight: 420,
          },
        }}
        height={450}
        onClose={() => setSelectedInfoFertilizer(null)}
      >
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {selectedInfoFertilizer && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>
                {selectedInfoFertilizer.name}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <Image
                  source={selectedInfoFertilizer.image}
                  style={styles.infoImage}
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.infoSubtitle}>Composition :</Text>
                  {selectedInfoFertilizer.name === "Urea" ? (
                    <>
                      <Text style={styles.infoComp}>• 46% Nitrogen (N)</Text>
                      <Text style={styles.infoComp}>• 20% Carbon (C)</Text>
                      <Text style={styles.infoComp}>• 26.6% Oxygen (O)</Text>
                      <Text style={styles.infoComp}>• 0.6% Hydrogen (H)</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.infoComp}>
                        • Example composition for {selectedInfoFertilizer.name}
                      </Text>
                    </>
                  )}
                </View>
              </View>
              <Text style={styles.infoHowTo}>How to use :</Text>
              <Text style={styles.infoDesc}>
                {selectedInfoFertilizer.name === "Urea"
                  ? `Urea is a key nitrogen fertilizer in tea cultivation, promoting healthy leaf growth.
It is applied in 3–4 split doses during the growing season, at 130–260 kg per hectare annually.
Spread it 15–20 cm away from the base of the bushes and lightly mix into the soil.
Apply before rain or irrigate lightly after application. Avoid contact with wet leaves to prevent burning, and do not overuse to maintain soil health.`
                  : `How to use instructions for ${selectedInfoFertilizer.name}...`}
              </Text>
            </View>
          )}
        </ScrollView>
      </RBSheet>

      {/* Fertilizer Selection Bottom Sheet (add items + quantities + cart) */}
      <RBSheet
        ref={selectionSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.4)" },
          draggableIcon: { backgroundColor: "#bbb" },
          container: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 16,
            minHeight: 300,
          },
        }}
        height={520}
      >
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <Text
            style={[styles.infoTitle, { alignSelf: "center", marginBottom: 8 }]}
          >
            Request Fertilizers
          </Text>
          <Text
            style={{ alignSelf: "center", marginBottom: 12, color: "#444" }}
          >
            Add fertilizers and quantities to the cart
          </Text>

    {loading ? (
      <View style={{ padding: 12 }}>
        <ActivityIndicator size="small" color="#183d2b" />
      </View>
    ) : error ? (
      <View style={{ padding: 12 }}>
        <Text style={{ color: '#900' }}>{error}</Text>
      </View>
    ) : (
              fertilizerTypes.map((item, idx) => (
            <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#fff', padding: 8, borderRadius: 12 }}>
              <Image source={[defaultImage1, defaultImage2, defaultImage3][idx % 3]} style={{ width: 80, height: 60, borderRadius: 8 }} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '700' }}>{item.name}</Text>
                <Text style={{ color: '#666' }}>Price : Rs.{item.price}.00  Unit weight :{item.unit}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity
                  style={[styles.sheetBtn, { minWidth: 80, backgroundColor: '#183d2b' }]}
      onPress={() => addToWorkingCart(item, 1)}
                >
                  <Text style={styles.sheetBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
    )}

          {/* Cart table */}
          <View
            style={{
              marginTop: 8,
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                paddingVertical: 6,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
              }}
            >
              <Text style={{ flex: 0.6, fontWeight: "700" }}>No</Text>
              <Text style={{ flex: 3, fontWeight: "700" }}>Name</Text>
              <Text
                style={{ flex: 1.4, textAlign: "center", fontWeight: "700" }}
              >
                Quantity
              </Text>
              <Text
                style={{ flex: 1.4, textAlign: "right", fontWeight: "700" }}
              >
                Total (Rs)
              </Text>
            </View>
            {workingCart.length === 0 && (
              <View style={{ padding: 12 }}>
                <Text style={{ color: "#666" }}>No items added</Text>
              </View>
            )}

            {workingCart.map((row, idx) => (
              <View
                key={row.id}
                style={{
                  flexDirection: "row",
                  paddingVertical: 10,
                  alignItems: "center",
                  borderBottomWidth: 1,
                  borderBottomColor: "#fafafa",
                }}
              >
                <Text style={{ flex: 0.6 }}>
                  {String(idx + 1).padStart(2, "0")}
                </Text>
                <Text style={{ flex: 3 }}>
                  {row.name} {row.unit}
                </Text>
                <View
                  style={{
                    flex: 1.4,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      updateWorkingQty(row.id, Math.max(0, row.qty - 1))
                    }
                    style={{ paddingHorizontal: 8 }}
                  >
                    <Text style={{ fontSize: 20 }}>−</Text>
                  </TouchableOpacity>
                  <Text style={{ marginHorizontal: 6 }}>{row.qty}</Text>
                  <TouchableOpacity
                    onPress={() => updateWorkingQty(row.id, row.qty + 1)}
                    style={{ paddingHorizontal: 8 }}
                  >
                    <Text style={{ fontSize: 20 }}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ flex: 1.4, textAlign: "right" }}>
                  {row.total.toFixed(2)}
                </Text>
              </View>
            ))}

            <View
              style={{
                flexDirection: "row",
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ flex: 3, fontSize: 18, fontWeight: "700" }}>
                Sub Total
              </Text>
              <Text
                style={{
                  flex: 1.4,
                  textAlign: "right",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                {workingCart.reduce((s, i) => s + i.total, 0).toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity style={[styles.requestButton, { marginTop: 8, alignSelf: 'flex-end', marginBottom: 6 }]} onPress={commitWorkingCart} disabled={placing}>
              {placing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.requestButtonText}>{selectionMode === 'edit' ? 'Edit Order' : 'Place Order'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </RBSheet>

      {/* Fertilizer Request State Modal */}
      {/* Fertilizer Request State Modal */}
      <RBSheet
        ref={requestSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.4)" },
          draggableIcon: { backgroundColor: "#bbb" },
          container: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            minHeight: 220,
            alignItems: "center",
            textAlign: "center",
            justifyContent: "center",
          },
        }}
        height={fertilizerState === "driver" ? 340 : 260}
      >
        <ScrollView
    showsVerticalScrollIndicator={true}
    contentContainerStyle={{ paddingBottom: 24 }}
  >
    {fertilizerState === 'placed' && (
          <View>
            <Text style={styles.reqCardLabel}>Fertilizer request</Text>
      <Text style={[styles.reqCardDate, fertilizerState === 'rejected' ? styles.reqCardDateRejected : null]}>Request placed</Text>
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.sheetBtn, { backgroundColor: '#183d2b', marginRight: 10 }]}
                onPress={() => {
                  requestSheetRef.current.close();
                  setTimeout(() => {
                    router.replace('/(role)/(nontabsmanager)/order');
                  }, 300);
                }}
              >
                <Text style={styles.sheetBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetBtn, { backgroundColor: '#590804' }]}
                onPress={() => {
                  setFertilizerState('none');
                  requestSheetRef.current.close();
                }}
              >
                <Text style={styles.sheetBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.sheetBtn, { backgroundColor: '#fff', marginTop: 18 }]}
              onPress={() => {
                setFertilizerState('driver');
                requestSheetRef.current.close();
              }}
            >
              <Text style={styles.sheetBtnText1}>Simulate Driver On The Way</Text>
            </TouchableOpacity>
          </View>
        )}

    {fertilizerState === 'driver' && (
          <View>
            <Text style={styles.reqCardLabel}>Fertilizer request</Text>
      <Text style={[styles.reqCardDate, fertilizerState === 'rejected' ? styles.reqCardDateRejected : null]}>Driver on the way</Text>
            <Text style={styles.reqCardDate}>Arriving at <Text style={{fontWeight:'bold'}}>5:45PM</Text></Text>
            <View style={{ backgroundColor:'#183d2b',borderTopLeftRadius:30, borderBottomLeftRadius:30,flexDirection:'row', alignItems:'center', padding:16, marginVertical:10,width:300 }}>
              <View style={{ width:60, height:60, borderRadius:30, backgroundColor:'#eee', marginRight:16, overflow:'hidden' }}>
                <Image source={require('../../../assets/images/driver.jpg')} style={{ width: 60, height: 60, borderRadius: 30 }} />
              </View>
              <View>
                <Text style={{ color:'#fff', fontSize:18, fontWeight:'700' }}>Saman</Text>
                <Text style={{ color:'#fff', fontSize:14 }}>is on the way</Text>
                <Text style={{ color:'#fff', fontSize:13 }}>Vehicle : <Text style={{ fontWeight:'bold' }}>LN 2535</Text></Text>
                <Text style={{ color:'#fff', fontSize:13, opacity:0.8 }}>Isuzu NKR66E</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.sheetBtn, { backgroundColor:'#183d2b', marginTop:0, width:120, alignSelf:'center' }]} onPress={() => { /* Simulate phone call */ }}>
              <Text style={{ color:'#fff', fontSize:16, fontWeight:'700' }}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sheetBtn, { backgroundColor:'#fff', marginTop:18 }]} onPress={() => { setFertilizerState('pending'); requestSheetRef.current.close(); }}>
              <Text style={styles.sheetBtnText1}>Simulate Delivery Pending</Text>
            </TouchableOpacity>
          </View>
        )}

    {fertilizerState === 'pending' && (
          <View>
            <Text style={styles.reqCardLabel}>Fertilizer request</Text>
      <Text style={[styles.reqCardDate, fertilizerState === 'rejected' ? styles.reqCardDateRejected : null]}>Confirmation pending</Text>
            <View style={{ backgroundColor:'#183d2b', borderRadius:16, padding:16, marginVertical:18 }}>
              <Text style={{ color:'#fff', fontSize:16, fontWeight:'700', marginBottom:8 }}>Collect your Fertilizers</Text>
              <Text style={{ color:'#fff', fontSize:14 }}>Request ID: 041</Text>
              <Text style={{ color:'#fff', fontSize:14 }}>Urea : 50kg</Text>
              <Text style={{ color:'#fff', fontSize:14 }}>Ammonium sulfate : 50kg</Text>
            </View>
            <View style={{ alignItems:'center', marginTop:18 }}>
              <SlideToConfirm
                unconfimredTipText="Slide to confirm Delivery"
                confirmedTipText="Confirmed"
                state={confirming}
                onSlideConfirmed={() => {
                  setConfirming(true);
                  setTimeout(() => {
                    setFertilizerState('none');
                    requestSheetRef.current.close();
                    setConfirming(false);
                  }, 1000);
                }}
                sliderStyle={{ width:300, height:60, borderRadius:30, backgroundColor: confirming ? '#6fcf97' : '#183d2b', justifyContent:'center' }}
                unconfirmedTipTextStyle={{ color:'#fff', fontSize:18, textAlign:'center', lineHeight:60, width:'100%', position:'absolute', left:0 }}
                confirmedTipTextStyle={{ color:'#fff', fontSize:18, textAlign:'center', lineHeight:60, width:'100%', position:'absolute', left:0 }}
                thumbStyle={{ backgroundColor:'#fff', marginLeft:10 }}
              />
            </View>
          </View>
        )}
        </ScrollView>
      </RBSheet>
    </>
  );
}

const CARD_WIDTH = 150;
const CARD_HEIGHT = 190;
const OVERLAY_HEIGHT = 38;

const styles = StyleSheet.create({
  container: {
    paddingTop: 2,
    paddingHorizontal: 16,
    backgroundColor: "#f4f8f4",
    alignItems: "center",
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    alignSelf: "flex-start",
    marginBottom: 12,
    marginLeft: 2,
  },
  sliderRow: {
    width: "100%",
    height: CARD_HEIGHT,
    marginBottom: 8,
  },
  fertilizerCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
    position: "relative",
  },
  fertilizerImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: "cover",
  },
  fertilizerLabelOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: OVERLAY_HEIGHT,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  fertilizerLabelOverlayText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  usageCard: {
    width: "100%",
    backgroundColor: "#eaf2ea",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  usageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  usageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },
  costLabel: {
    fontSize: 14,
    color: "#222",
    marginTop: 2,
  },
  costValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#000",
    marginVertical: 2,
    marginBottom: 4,
  },
  costRs: {
    fontSize: 18,
    color: "#222",
    fontWeight: "400",
  },
  dateLabel: {
    fontSize: 14,
    color: "#222",
    marginVertical: 1,
  },
  viewButton: {
    marginTop: 0,
    backgroundColor: "#183d2b",
    paddingVertical: 9,
    paddingHorizontal: 38,
    borderRadius: 30,
    alignSelf: "flex-end",
    elevation: 1,
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "400",
  },
  requestButton: {
    backgroundColor: "#183d2b",
    borderRadius: 40,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 2,
    alignSelf: "center",
    marginBottom: 8,
    elevation: 2,
  },
  requestButtonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "400",
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "flex-start",
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: "700",
    alignSelf: "center",
    marginBottom: 10,
  },
  infoImage: {
    width: 110,
    height: 110,
    borderRadius: 14,
    marginRight: 12,
  },
  infoSubtitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
    marginTop: 2,
  },
  infoComp: {
    fontSize: 14,
    color: "#222",
    marginBottom: 1,
  },
  infoHowTo: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 14,
    color: "#222",
    marginTop: 2,
    lineHeight: 20,
    textAlign: "justify",
  },
  // --- new for fertilizer request card/modal ---
  requestPlacedCard: {
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
    width: "100%",
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
    marginBottom: 3,
  },
  reqCardDateRejected: {
    color: '#b00020',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
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
});
