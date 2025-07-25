import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SlideToConfirm from 'rn-slide-to-confirm';


const fertilizerTypes = [
  {
    id: 1,
    name: 'Urea',
    image: require('../../../assets/images/fert1.jpg'),
    price: 1000,
    unit: '50kg'
  },
  {
    id: 2,
    name: 'Ammonium sulfate',
    image: require('../../../assets/images/fert2.jpg'),
    price: 1200,
    unit: '50kg'
  },
  {
    id: 3,
    name: 'Urea',
    image: require('../../../assets/images/fert1.jpg'),
    price: 1000,
    unit: '50kg'
  },
  {
    id: 4,
    name: 'Ammonium sulfate',
    image: require('../../../assets/images/fert2.jpg'),
    price: 1200,
    unit: '50kg'
  },
  {
    id: 5,
    name: 'Urea',
    image: require('../../../assets/images/fert1.jpg'),
    price: 1000,
    unit: '50kg'
  },
  {
    id: 6,
    name: 'Ammonium sulfate',
    image: require('../../../assets/images/fert2.jpg'),
    price: 1200,
    unit: '50kg'
  },
];

export default function FertilizerPage() {
  const infoSheetRef = useRef();
  const requestSheetRef = useRef();
  const [selectedInfoFertilizer, setSelectedInfoFertilizer] = useState(null);
  const [fertilizerState, setFertilizerState] = useState('none'); // 'none', 'placed', 'driver', 'pending'
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  // Open the request modal
  const openRequestModal = () => {
    requestSheetRef.current.open();
  };

  return (
    <>
      <ScrollView
  contentContainerStyle={[styles.container, { paddingBottom: 90 }]}
  showsVerticalScrollIndicator={false}
>
   <Text style={styles.title}>Fertilizers</Text>

        {/* Fertilizer Types Slider (MAIN PAGE) */}
        <View style={styles.sliderRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}  >
            {fertilizerTypes.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.fertilizerCard}
                onPress={() => {
                  setSelectedInfoFertilizer(item);
                  infoSheetRef.current.open();
                }}
              >
                <Image source={item.image} style={styles.fertilizerImage} />
                <View style={styles.fertilizerLabelOverlay}>
                  <Text style={styles.fertilizerLabelOverlayText}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
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
          <TouchableOpacity style={styles.viewButton}  onPress={() => router.replace('/usage')}>
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>

        {/* Request Placed Card */}
        {fertilizerState !== 'none' && (
          <TouchableOpacity
            style={styles.requestPlacedCard}
            onPress={openRequestModal}
          >
            <Text style={styles.reqCardLabel}>Fertilizer request placed</Text>
            <Text style={styles.reqCardDate}>
              {fertilizerState === 'placed' && 'Tap to edit or cancel'}
              {fertilizerState === 'driver' && 'Driver on the way'}
              {fertilizerState === 'pending' && 'Delivery confirmation pending'}
            </Text>
            {fertilizerState === 'driver' && (
              <Text style={styles.reqCardDate}>Arriving at <Text style={{fontWeight:'bold'}}>5:45PM</Text></Text>
            )}
            {fertilizerState === 'pending' && (
              <Text style={styles.reqCardDate}>Collect your Fertilizers</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Request Fertilizer Button & Next Button */}
        {fertilizerState === 'none' && (
          <>
            <TouchableOpacity
              style={styles.requestButton}
              onPress={() => {
                router.push('/(role)/(manager)/(nontabs)/order');
              }}
            >
              <Text style={styles.requestButtonText}>Request Fertilizer</Text>
            </TouchableOpacity>
            {/* Next Button to simulate placing order */}
            <TouchableOpacity
              style={[styles.requestButton, { backgroundColor: '#aaa', marginTop: 8 }]}
              onPress={() => setFertilizerState('placed')}
            >
              <Text style={[styles.requestButtonText, { color: '#222' }]}>Next</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Fertilizer Info Bottom Sheet (shows correct fertilizer details) */}
      <RBSheet
        ref={infoSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          wrapper: { backgroundColor: 'rgba(0,0,0,0.4)' },
          draggableIcon: { backgroundColor: '#bbb' },
          container: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 420 },
        }}
        height={450}
        onClose={() => setSelectedInfoFertilizer(null)}
      >
        <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 24 }}>
          {selectedInfoFertilizer && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>{selectedInfoFertilizer.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                <Image
                  source={selectedInfoFertilizer.image}
                  style={styles.infoImage}
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.infoSubtitle}>Composition :</Text>
                  {selectedInfoFertilizer.name === 'Urea' ? (
                    <>
                      <Text style={styles.infoComp}>• 46% Nitrogen (N)</Text>
                      <Text style={styles.infoComp}>• 20% Carbon (C)</Text>
                      <Text style={styles.infoComp}>• 26.6% Oxygen (O)</Text>
                      <Text style={styles.infoComp}>• 0.6% Hydrogen (H)</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.infoComp}>• Example composition for {selectedInfoFertilizer.name}</Text>
                    </>
                  )}
                </View>
              </View>
              <Text style={styles.infoHowTo}>How to use :</Text>
              <Text style={styles.infoDesc}>
                {selectedInfoFertilizer.name === 'Urea'
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

      {/* Fertilizer Request State Modal */}
      <RBSheet
        ref={requestSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          wrapper: { backgroundColor: 'rgba(0,0,0,0.4)' },
          draggableIcon: { backgroundColor: '#bbb' },
          container: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 220, alignItems:'center',textAlign:'center',justifyContent:'center' },
        }}
        height={fertilizerState === 'driver' ? 340 : 260}
      >
        <ScrollView
    showsVerticalScrollIndicator={true}
    contentContainerStyle={{ paddingBottom: 24 }}
  >
        {fertilizerState === 'placed' && (
          <View>
            <Text style={styles.reqCardLabel}>Fertilizer request</Text>
            <Text style={styles.reqCardDate}>Request placed</Text>
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
            <Text style={styles.reqCardDate}>Driver on the way</Text>
            <Text style={styles.reqCardDate}>Arriving at <Text style={{fontWeight:'bold'}}>5:45PM</Text></Text>
            <View style={{ backgroundColor: '#183d2b',borderTopLeftRadius:30, borderBottomLeftRadius:30,flexDirection: 'row', alignItems: 'center', padding: 16, marginVertical: 10,width:300 }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee', marginRight: 16, overflow: 'hidden' }}>
                <Image source={require('../../../assets/images/driver.jpg')} style={{ width: 60, height: 60, borderRadius: 30 }} />
              </View>
              <View>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Saman</Text>
                <Text style={{ color: '#fff', fontSize: 14 }}>is on the way</Text>
                <Text style={{ color: '#fff', fontSize: 13 }}>Vehicle : <Text style={{ fontWeight: 'bold' }}>LN 2535</Text></Text>
                <Text style={{ color: '#fff', fontSize: 13, opacity: 0.8 }}>Isuzu NKR66E</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.sheetBtn, { backgroundColor: '#183d2b', marginTop: 0, width: 120, alignSelf: 'center' }]}
              onPress={() => {
                // Simulate phone call
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sheetBtn, { backgroundColor: '#fff', marginTop: 18 }]}
              onPress={() => {
                setFertilizerState('pending');
                requestSheetRef.current.close();
              }}
            >
              <Text style={styles.sheetBtnText1}>Simulate Delivery Pending</Text>
            </TouchableOpacity>
          </View>
        )}

        {fertilizerState === 'pending' && (
  <View>
    <Text style={styles.reqCardLabel}>Fertilizer request</Text>
    <Text style={styles.reqCardDate}>Confirmation pending</Text>
    <View style={{ backgroundColor: '#183d2b', borderRadius: 16, padding: 16, marginVertical: 18 }}>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Collect your Fertilizers</Text>
      <Text style={{ color: '#fff', fontSize: 14 }}>Request ID: 041</Text>
      <Text style={{ color: '#fff', fontSize: 14 }}>Urea : 50kg</Text>
      <Text style={{ color: '#fff', fontSize: 14 }}>Ammonium sulfate : 50kg</Text>
    </View>
    <View style={{ alignItems: 'center', marginTop: 18 }}>
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
  sliderStyle={{
    width: 300,
    height: 60,
    borderRadius: 30,
    backgroundColor: confirming ? '#6fcf97' : '#183d2b',
    // Remove alignItems: 'center' here!
    justifyContent: 'center', // This is fine for vertical centering
  }}
  unconfirmedTipTextStyle={{
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 60,
    width: '100%', // Ensures text is centered across the slider
    position: 'absolute', // Optional: ensures text overlays the slider
    left: 0,
  }}
  confirmedTipTextStyle={{
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 60,
    width: '100%',
    position: 'absolute',
    left: 0,
  }}
  thumbStyle={{
    backgroundColor: '#fff',
    marginLeft:10,
    // No margin or alignment here!
  }}
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
    backgroundColor: '#f4f8f4',
    alignItems: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    alignSelf: 'flex-start',
    marginBottom: 12,
    marginLeft: 2,
  },
  sliderRow: {
    width: '100%',
    height: CARD_HEIGHT,
    marginBottom: 8,
  },
  fertilizerCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  fertilizerImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: 'cover',
  },
  fertilizerLabelOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: OVERLAY_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  fertilizerLabelOverlayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  usageCard: {
    width: '100%',
    backgroundColor: '#eaf2ea',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  usageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  costLabel: {
    fontSize: 14,
    color: '#222',
    marginTop: 2,
  },
  costValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000',
    marginVertical: 2,
    marginBottom: 4,
  },
  costRs: {
    fontSize: 18,
    color: '#222',
    fontWeight: '400',
  },
  dateLabel: {
    fontSize: 14,
    color: '#222',
    marginVertical: 1,
  },
  viewButton: {
    marginTop: 0,
    backgroundColor: '#183d2b',
    paddingVertical: 9,
    paddingHorizontal: 38,
    borderRadius: 30,
    alignSelf: 'flex-end',
    elevation: 1,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '400',
  },
  requestButton: {
    backgroundColor: '#183d2b',
    borderRadius: 40,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginTop: 2,
    alignSelf: 'center',
    marginBottom: 8,
    elevation: 2,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '400',
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'flex-start',
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '700',
    alignSelf: 'center',
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
    fontWeight: '600',
    marginBottom: 2,
    marginTop: 2,
  },
  infoComp: {
    fontSize: 14,
    color: '#222',
    marginBottom: 1,
  },
  infoHowTo: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 14,
    color: '#222',
    marginTop: 2,
    lineHeight: 20,
    textAlign: 'justify',
  },
  // --- new for fertilizer request card/modal ---
  requestPlacedCard: {
    backgroundColor: '#eaf2ea',
    marginTop: 12,
    marginBottom: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    width: '100%',
  },
  reqCardLabel: {
    color: '#222',
    fontSize: 25,
    fontWeight: '400',
    marginBottom: 1,
  },
  reqCardDate: {
    color: '#222',
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 3,
  },
  sheetBtn: {
    minWidth: 120, borderRadius: 18, paddingVertical: 12, alignItems: 'center', marginTop: 8,
  },
  sheetBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  sheetBtnText1: { color: '#000', fontSize: 17, fontWeight: '700' },
});
