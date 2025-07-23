import React, { useState, useRef, useEffect } from "react";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  TextInput,
  ImageBackground,
  Dimensions,
  FlatList,
  ScrollView,
  Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE, Polygon } from "react-native-maps";
import { BASE_URL } from "../../../constants/ApiConfig";

// ----- FACTORIES DATA (FETCHED FROM BACKEND) -----
const factoryImages = {
  "Andaradeniya Tea Factory": require("../../../assets/images/fac2.jpg"),
  "Batuwangala Tea Factory": require("../../../assets/images/fac2.jpg"),
  "Ruhuna Tea Factory": require("../../../assets/images/fac2.jpg"),
  "Duli Ella Tea Factory": require("../../../assets/images/fac2.jpg"),
  "Fortune Tea Factory": require("../../../assets/images/fac2.jpg"),
  "Waulugala Tea Factory": require("../../../assets/images/fac1.jpg"),
  "Williegroup Tea Factory": require("../../../assets/images/fac2.jpg"),
  "Devonia Tea Factory": require("../../../assets/images/fac2.jpg"),
  "Galaxy Tea Factory": require("../../../assets/images/fac2.jpg"),
  "Nivithigala Tea Factory": require("../../../assets/images/fac2.jpg"),
};

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;
const CARD_HEIGHT = 150;
const totalSteps = 3;

// ====== MAP PICKER OVERLAY - MOVED OUTSIDE ======
const MapPickerOverlay = ({
  showMap,
  mapRegion,
  setMapRegion,
  mapRef,
  tempMarker,
  setTempMarker,
  searchQuery,
  setSearchQuery,
  searchLocation,
  setShowMap,
  mapField,
  setMapField,
  setLandDetails,
  bounds,
}) => {
  if (!showMap) return null;
  return (
    <View style={styles.mapOverlay}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a place..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchLocation}
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchLocation}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        ref={mapRef}
        style={styles.smallMap}
        region={mapRegion}
        onPress={(e) => {
          setTempMarker(e.nativeEvent.coordinate);
        }}
      >
        {tempMarker && <Marker coordinate={tempMarker} />}
        {/* Only show marker, no bounding box */}
      </MapView>

      {/* Control Buttons */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setShowMap(false);
            setTempMarker(null);
            setSearchQuery("");
            setMapField(null);
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => {
            if (!tempMarker)
              return Alert.alert(
                "Select a location",
                "Tap on the map or search for a place to select a location."
              );
            const url = `https://maps.google.com/?q=${tempMarker.latitude},${tempMarker.longitude}`;
            setLandDetails((prev) => ({
              ...prev,
              [mapField]: url,
            }));
            setTempMarker(null);
            setSearchQuery("");
            setShowMap(false);
            setMapField(null);
          }}
        >
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ====== MAIN COMPONENT ======
export default function PendingSupplyOnboarding() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (!storedUserId) {
          setStatus(null);
          setLoading(false);
          return;
        }
        const response = await fetch(
          `${BASE_URL}/api/supplier-requests?userId=${storedUserId}`
        );
        const data = await response.json();
        if (!data || (Array.isArray(data) && data.length === 0)) {
          setStatus(null);
        } else {
          const request = Array.isArray(data) ? data[0] : data;
          if (request.status === "rejected") {
            setStatus("rejected");
            setRejectReason(request.rejectReason || "No reason provided.");
          } else {
            setStatus("pending");
          }
        }
      } catch (err) {
        setStatus(null);
      }
      setLoading(false);
    };
    fetchStatus();
  }, []);
  // Add missing handler for NIC submission
  const [requestStatus, setRequestStatus] = useState(null);
  const [userId, setUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const handleSubmitSupplierRequest = async () => {
    setSubmitting(true);
    try {
      // Always get userId from AsyncStorage before sending supplier request
      const storedUserId = await AsyncStorage.getItem("userId");
      const supplierUserId =
        storedUserId && !isNaN(Number(storedUserId))
          ? Number(storedUserId)
          : null;
      console.log("Supplier userId:", supplierUserId);
      // Construct FormData for backend submission
      const supplierRequestData = {
        factoryId: selectedFactory?.id ? Number(selectedFactory.id) : null,
        userId: supplierUserId,
        status: "pending",
        landSize: landDetails.land_size ? Number(landDetails.land_size) : null,
        landLocation: landDetails.land_location,
        pickupLocation: landDetails.pickup_location,
        monthlySupply: landDetails.monthly_supply
          ? Number(landDetails.monthly_supply)
          : null,
      };
      const formData = new FormData();
      formData.append("supplierRequest", JSON.stringify(supplierRequestData));
      if (nicImage) {
        formData.append("nicImage", {
          uri: nicImage.uri,
          name: nicImage.fileName || "nic.jpg",
          type: "image/jpeg",
        });
      }
      // Send to backend
      const response = await fetch(`${BASE_URL}/api/supplier-requests/`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      // Show pending UI after successful request
      setRequestStatus("pending");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to submit request. Try Again",
        position: "center",
        visibilityTime: 4000,
        props: {
          onPress: () => {
            setStep(0);
            Toast.hide();
          },
        },
      });
    }
    setSubmitting(false);
  };
  const [factories, setFactories] = useState([]);
  React.useEffect(() => {
    const fetchFactories = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/factories`);
        const data = await response.json();
        // Preserve full factory object and add hardcoded image
        const mapped = data.map((f) => ({
          ...f,
          image:
            factoryImages[f.name] || require("../../../assets/images/fac2.jpg"),
        }));
        setFactories(mapped);
      } catch (_err) {
        setFactories([]);
      }
    };
    fetchFactories();
  }, []);
  const [step, setStep] = useState(0);
  const [selectedFactory, setSelectedFactory] = useState(null); // will store the factory object
  const [selectedFactoryIndex, setSelectedFactoryIndex] = useState(0);
  const [landDetails, setLandDetails] = useState({
    land_size: "",
    land_location: "",
    pickup_location: "",
    monthly_supply: "",
  });
  const [nicImage, setNicImage] = useState(null);

  // For inline map picker with search
  const [showMap, setShowMap] = useState(false);
  const [mapField, setMapField] = useState(null);
  const [tempMarker, setTempMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapRegion, setMapRegion] = useState({
    latitude: 6.9271,
    longitude: 79.8612,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });
  const [bounds, setBounds] = useState(null);

  const carouselRef = useRef();
  const mapRef = useRef();
  const router = useRouter();

  let canProceed = false;
  if (step === 0) canProceed = !!selectedFactory;
  if (step === 1)
    canProceed = Object.values(landDetails).every((v) => v.trim().length > 0);
  if (step === 2) canProceed = !!nicImage;
  if (step === 3) canProceed = true;

  // Search for places using Google Maps Geocoding API (for bounds)
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    try {
      // Use Google Maps Geocoding API for more details
      const apiKey = "AIzaSyCC1yw0F2ZC9dCYPDmcEdm3VAU6UqTYefo"; // <-- User's provided key
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;
        const bounds = result.geometry.bounds || result.geometry.viewport;
        let latitudeDelta = 0.05;
        let longitudeDelta = 0.05;
        if (bounds) {
          latitudeDelta =
            Math.abs(bounds.northeast.lat - bounds.southwest.lat) * 1.2;
          longitudeDelta =
            Math.abs(bounds.northeast.lng - bounds.southwest.lng) * 1.2;
        }
        setMapRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta,
          longitudeDelta,
        });
        setTempMarker({
          latitude: location.lat,
          longitude: location.lng,
        });
        if (bounds) {
          setBounds({
            northeast: bounds.northeast,
            southwest: bounds.southwest,
          });
        } else {
          setBounds(null);
        }
        // Animate to the searched location with calculated zoom
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: location.lat,
              longitude: location.lng,
              latitudeDelta,
              longitudeDelta,
            },
            1000
          );
        }
      } else {
        Alert.alert("Location not found", "Please try a different search term");
        setBounds(null);
      }
    } catch (_error) {
      Alert.alert("Search Error", "Unable to search for that location");
      setBounds(null);
    }
  };

  function FactoryCarousel() {
    const carouselCardWidth = CARD_WIDTH;
    const marginHorizontal = 8;
    return (
      <View style={{ alignItems: "center", width: "100%", marginBottom: 7 }}>
        <FlatList
          ref={carouselRef}
          data={factories}
          horizontal
          pagingEnabled
          snapToInterval={CARD_WIDTH + marginHorizontal * 2}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setSelectedFactory(item);
                setSelectedFactoryIndex(index);
                carouselRef.current?.scrollToIndex({ index, animated: true });
              }}
              style={[
                {
                  width: carouselCardWidth,
                  height: CARD_HEIGHT,
                  marginHorizontal,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: "#f1fcf4",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: selectedFactoryIndex === index ? 2 : 0,
                  borderColor: "#175032",
                  elevation: selectedFactoryIndex === index ? 7 : 2,
                },
              ]}
            >
              <Image
                source={item.image}
                style={{ width: "100%", height: "100%", resizeMode: "cover" }}
              />
              <View style={styles.captionTop}>
                <Text style={styles.captionTopText}>{item.name}</Text>
              </View>
              <View style={styles.captionBottom}>
                {/* Show address/location, split if comma exists */}
                {item.location &&
                  item.location.split(",").map((part, i) => (
                    <Text key={i} style={styles.captionBottomText}>
                      {part.trim()}
                    </Text>
                  ))}
              </View>
            </TouchableOpacity>
          )}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(
              e.nativeEvent.contentOffset.x /
                (carouselCardWidth + marginHorizontal * 2)
            );
            if (factories[idx]) {
              setSelectedFactoryIndex(idx);
              setSelectedFactory(factories[idx]); // This updates dropdown selection
            }
          }}
          getItemLayout={(_, index) => ({
            length: carouselCardWidth + marginHorizontal * 2,
            offset: (carouselCardWidth + marginHorizontal * 2) * index,
            index,
          })}
          style={{
            flexGrow: 0,
            width: CARD_WIDTH + marginHorizontal * 2,
            alignSelf: "center",
          }}
          contentContainerStyle={{}}
        />
      </View>
    );
  }

  // Camera/Gallery handler for NIC image
  const handleNicImagePick = async () => {
    // Ask user to choose Camera or Gallery
    Alert.alert("NIC Image", "Choose how to upload your NIC image", [
      {
        text: "Camera",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            alert("Camera permission is required!");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            setNicImage(result.assets[0]);
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            alert("Gallery permission is required!");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            setNicImage(result.assets[0]);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  function renderStep() {
    if (loading) {
      return (
        <View style={styles.mainCard}>
          <ScrollView
            contentContainerStyle={{
              minHeight: 460,
              paddingBottom: 220,
              justifyContent: "center",
              alignItems: "center",
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.headerText}>Loading...</Text>
          </ScrollView>
        </View>
      );
    }
    if (status === "pending") {
      return (
        <View style={styles.mainCard}>
          <ScrollView
            contentContainerStyle={{
              minHeight: 460,
              paddingBottom: 220,
              justifyContent: "center",
              alignItems: "center",
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.headerText}>
              Your Request is Not Approved Yet
            </Text>
            <Text style={styles.subText}>
              Your submission is under review by our team. You will receive a
              notification once your profile has been approved for supplying.
              Please be patient.
            </Text>
          </ScrollView>
        </View>
      );
    }
    if (status === "rejected") {
      return (
        <View style={styles.mainCard}>
          <ScrollView
            contentContainerStyle={{
              minHeight: 460,
              paddingBottom: 220,
              justifyContent: "center",
              alignItems: "center",
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.headerText, { color: "#b22222" }]}>
              Your Request Has Been Rejected
            </Text>
            <Text
              style={[
                styles.subText,
                { color: "#b22222", fontWeight: "bold", marginTop: 8 },
              ]}
            >
              Reason: {rejectReason}
            </Text>
          </ScrollView>
        </View>
      );
    }
    // ...existing code for onboarding steps...
    if (step === 0) {
      return (
        <View>
          <Text style={styles.headerText}>
            Complete your account to start supplying
          </Text>
          <Text style={styles.label}>
            Select the factory you are willing to supply to
          </Text>
          <View style={styles.innerSubCard}>
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              itemTextStyle={styles.dropdownItemText}
              selectedTextStyle={styles.dropdownSelectedText}
              data={factories.map((f) => ({
                label: f.name,
                value: f.id.toString(),
              }))}
              labelField="label"
              valueField="value"
              placeholder="Select factory"
              value={selectedFactory ? selectedFactory.id.toString() : null}
              onChange={(item) => {
                const idx = factories.findIndex(
                  (f) => f.id.toString() === item.value
                );
                setSelectedFactory(factories[idx]);
                setSelectedFactoryIndex(idx);
                setTimeout(() => {
                  carouselRef.current?.scrollToIndex({
                    index: idx,
                    animated: true,
                  });
                }, 100);
              }}
            />
            <FactoryCarousel />
            <TouchableOpacity
              style={[
                styles.nextBtn,
                !canProceed && { backgroundColor: "#ccd9ce" },
              ]}
              disabled={!canProceed}
              onPress={() => {
                const supplierRequest = {
                  factoryId: selectedFactory ? selectedFactory.id : null,
                };
                console.log("Selected Factory ID:", supplierRequest.factoryId);
                setStep(step + 1);
              }}
            >
              <Text style={styles.nextBtnText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    if (step === 1) {
      return (
        <View>
          <Text style={styles.headerText}>Land Details</Text>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 50,
              width: "100%",
            }}
            keyboardShouldPersistTaps="handled"
          >
            {[
              "Land Size (acres)",
              "Land Location",
              "Pickup Location",
              "Monthly Supply (kg)",
            ].map((label, i) => {
              const key = Object.keys(landDetails)[i];
              const isLocation =
                key === "land_location" || key === "pickup_location";
              const hasValue = landDetails[key].trim().length > 0;
              return (
                <React.Fragment key={i}>
                  <Text style={styles.label}>{label}</Text>
                  <TouchableOpacity
                    activeOpacity={isLocation ? 0.7 : 1}
                    onPress={() => {
                      if (isLocation) {
                        setShowMap(true);
                        setMapField(key);
                      }
                    }}
                  >
                    <TextInput
                      style={[styles.input, hasValue && styles.inputActive]}
                      value={landDetails[key]}
                      editable={!isLocation}
                      pointerEvents={isLocation ? "none" : "auto"}
                      onChangeText={(t) =>
                        setLandDetails((prev) => ({
                          ...prev,
                          [key]: t,
                        }))
                      }
                      placeholder={
                        isLocation ? `Tap to select ${label}` : `Enter ${label}`
                      }
                      keyboardType={
                        label.includes("Size") || label.includes("Supply")
                          ? "numeric"
                          : "default"
                      }
                      placeholderTextColor="#888"
                    />
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}

            {/* Back and Next buttons */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.nextBtn,
                  { backgroundColor: "#ccd9ce", flex: 1, marginRight: 8 },
                ]}
                onPress={() => setStep(step - 1)}
              >
                <Text style={[styles.nextBtnText, { color: "#175032" }]}>
                  Back
                </Text>
              </TouchableOpacity>
              {step > 0 && step < totalSteps - 1 && (
                <TouchableOpacity
                  style={[
                    styles.nextBtn,
                    { flex: 1, marginLeft: 8 },
                    !canProceed && { backgroundColor: "#ccd9ce" },
                  ]}
                  disabled={!canProceed}
                  onPress={() => {
                    // Log land details to console as requested
                    console.log({
                      landSize: landDetails.land_size,
                      monthlySupply: landDetails.monthly_supply,
                      pickupLocation: landDetails.pickup_location,
                      landLocation: landDetails.land_location,
                    });
                    setStep(step + 1);
                  }}
                >
                  <Text style={styles.nextBtnText}>Next</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      );
    }
    if (step === 2) {
      return (
        <View>
          <Text style={styles.headerText}>NIC Verification</Text>
          <Text style={styles.subText}>Please upload a photo of your NIC</Text>
          <TouchableOpacity
            style={styles.uploadArea}
            onPress={handleNicImagePick}
            activeOpacity={0.85}
            disabled={submitting}
          >
            {nicImage ? (
              <Image source={{ uri: nicImage.uri }} style={styles.nicImage} />
            ) : (
              <Text style={styles.uploadPrompt}>Tap to upload NIC</Text>
            )}
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 14,
            }}
          >
            <TouchableOpacity
              style={[
                styles.nextBtn,
                { backgroundColor: "#ccd9ce", flex: 1, marginRight: 8 },
              ]}
              onPress={() => setStep(step - 1)}
              disabled={submitting}
            >
              <Text style={[styles.nextBtnText, { color: "#175032" }]}>
                Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.nextBtn,
                { flex: 1, marginLeft: 8 },
                submitting && { opacity: 0.7 },
              ]}
              onPress={async () => {
                if (submitting) return;
                await handleSubmitSupplierRequest();
                Toast.show({
                  type: "success",
                  text1: "Application Submitted! You will be approved soon.",
                  position: "center",
                  visibilityTime: 3500,
                  onHide: () => router.replace("/(nontabs)"),
                });
                setTimeout(() => {
                  router.replace("/(nontabs)");
                }, 3500);
              }}
              disabled={submitting}
            >
              {submitting ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 3,
                      borderColor: "#fff",
                      borderTopColor: "#175032",
                      marginRight: 8,
                      borderStyle: "solid",
                      borderLeftColor: "#175032",
                      borderBottomColor: "#175032",
                      borderRightColor: "#fff",
                    }}
                  >
                    <View
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      {/* Simple spinner animation using React Native's Animated API can be added for better effect */}
                    </View>
                  </View>
                  <Text style={styles.nextBtnText}>Submitting...</Text>
                </View>
              ) : (
                <Text style={styles.nextBtnText}>Finish</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    // Removed step 3 (Thank you step) as it is not needed
    return null;
  }

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.greetingCard}>
          <ImageBackground
            source={require("../../../assets/images/hero.jpg")}
            style={styles.greetingImage}
            imageStyle={styles.greetingImageBorder}
          >
            <View style={styles.greetingOverlay}>
              <Text style={styles.greetingText}>Welcome Shehan!</Text>
            </View>
          </ImageBackground>
        </View>
        <View style={styles.mainCard}>
          <ScrollView
            contentContainerStyle={{ minHeight: 460, paddingBottom: 220 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {renderStep()}
            <View style={styles.dotsRow}>
              {[...Array(totalSteps)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === step ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
            {/* ---- MOVED: THE OVERLAY IS CALLED HERE AS A PROP-PASSED COMPONENT ---- */}
            <MapPickerOverlay
              showMap={showMap}
              mapRegion={mapRegion}
              setMapRegion={setMapRegion}
              mapRef={mapRef}
              tempMarker={tempMarker}
              setTempMarker={setTempMarker}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchLocation={searchLocation}
              setShowMap={setShowMap}
              mapField={mapField}
              setMapField={setMapField}
              setLandDetails={setLandDetails}
              bounds={bounds}
            />
          </ScrollView>
        </View>
        <Toast />
      </SafeAreaView>
    </View>
  );
}

// ------- THE STYLES (UNCHANGED) -------
const styles = StyleSheet.create({
  nicImage: {
    width: "100%",
    height: 180,
    borderRadius: 13,
    resizeMode: "cover",
  },
  uploadPrompt: {
    color: "#175032",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 70,
  },
  bg: { flex: 1, backgroundColor: "#eaf2ea" },
  safeArea: { flex: 1, alignItems: "center" },
  greetingCard: {
    width: "97%",
    borderRadius: 22,
    overflow: "hidden",
    marginTop: 18,
    marginBottom: 12,
    alignSelf: "center",
    elevation: 5,
    backgroundColor: "#eaeaeae0",
  },
  greetingImage: { width: "100%", height: 100, justifyContent: "center" },
  greetingImageBorder: { borderRadius: 22 },
  greetingOverlay: {
    flex: 1,
    backgroundColor: "rgba(40,64,35,0.22)",
    borderRadius: 22,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  greetingText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textShadowColor: "#222c",
    textShadowRadius: 7,
    marginLeft: 6,
  },
  mainCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 23,
    width: "97%",
    alignSelf: "center",
    elevation: 4,
    marginBottom: 20,
  },
  innerCard: {
    width: "97%",
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  innerSubCard: {
    width: "100%",
    backgroundColor: "#f8fafb",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: "#dde5db",
    textAlign: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#183d2b",
    marginBottom: 6,
    textAlign: "center",
  },
  subText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#365948",
    marginBottom: 12,
    textAlign: "center",
    marginHorizontal: 10,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 15,
    color: "#1a290b",
    marginTop: 10,
    marginBottom: 2,
    fontWeight: "500",
    marginLeft: 6,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#ecf5ef",
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 7,
    color: "#24411b",
    borderWidth: 1.5,
    borderColor: "#bdd7c4",
  },
  inputActive: {
    borderColor: "#175032",
    backgroundColor: "#f0f8f0",
  },
  dropdown: {
    width: "96%",
    marginBottom: 12,
    marginTop: 6,
    backgroundColor: "#f3f9f3",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#175032",
  },
  dropdownContainer: {
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#175032",
    marginTop: 4,
    maxHeight: 180,
  },
  dropdownItemText: {
    color: "#153823",
    fontSize: 16,
    paddingVertical: 8,
    textAlign: "center",
  },
  dropdownSelectedText: {
    color: "#183d2b",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  captionTop: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(30,70,32,0.65)",
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  captionTopText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  captionBottom: {
    position: "absolute",
    bottom: 11,
    left: 12,
    right: 12,
    backgroundColor: "rgba(30,40,40,0.60)",
    borderRadius: 13,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  captionBottomText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "400",
  },
  uploadArea: {
    width: "100%",
    height: 180,
    borderRadius: 13,
    resizeMode: "cover",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    alignItems: "center",
  },
  dot: { width: 12, height: 12, borderRadius: 6, margin: 6 },
  dotActive: { backgroundColor: "#175032" },
  dotInactive: { backgroundColor: "#c4d3bd" },
  nextBtn: {
    width: "84%",
    backgroundColor: "#175032",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
    alignSelf: "center",
    elevation: 2,
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 100,
  },
  searchContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchButton: {
    backgroundColor: "#175032",
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    fontSize: 18,
  },
  mapControls: {
    marginTop: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  confirmButton: {
    backgroundColor: "#175032",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  smallMap: {
    width: 320,
    height: 220,
    borderRadius: 16,
    alignSelf: "center",
  },
});
