import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';


const suppliers = [
  {
    id: 1,
    name: 'Malkanthi',
    bags: 5,
    image: require('../../../assets/images/propic.jpg'),
  },
  {
    id: 2,
    name: 'Saman',
    bags: 10,
    image: require('../../../assets/images/propic.jpg'),
  },
  {
    id: 3,
    name: 'Amal',
    bags: 5,
    image: require('../../../assets/images/propic.jpg'),
  },
  {
    id: 4,
    name: 'Chamara',
    bags: 10,
    image: require('../../../assets/images/propic.jpg'),
  },
  {
    id: 5,
    name: 'Nimal',
    bags: 10,
    image: require('../../../assets/images/propic.jpg'),
  },
  {
    id: 6,
    name: 'Kamal',
    bags: 10,
    image: require('../../../assets/images/propic.jpg'),
  },
];

export default function SupplierHome() {
  const [pickedState, setPickedState] = useState({
    vehicle: false,
    bags: false,
    fertilizer: false,
    cheques: false,
  });
  const [supplierModalVisible, setSupplierModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchText, setSearchText] = useState('');

  const allPicked =
    pickedState.vehicle &&
    pickedState.bags &&
    pickedState.fertilizer &&
    pickedState.cheques;

  const filteredSuppliers =
    searchText.trim() === ''
      ? suppliers
      : suppliers.filter(s =>
          s.name.toLowerCase().includes(searchText.toLowerCase())
        );

         const router = useRouter();
  const OutsidePressHandler = ({ onPress, children }) => (
  <TouchableWithoutFeedback
    onPress={() => {
      Keyboard.dismiss();
      onPress();
    }}
  >
    <View style={styles.modalOverlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <TouchableWithoutFeedback>{children}</TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  </TouchableWithoutFeedback>
);


  return (
    <View style={{ flex: 1, backgroundColor: '#f4f8f4' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.heroCard}>
          <ImageBackground
            source={require('../../../assets/images/hero.jpg')}
            style={styles.heroImg}
            imageStyle={{ borderRadius: 16 }}
          >
            <Text style={styles.hello}>Hi Shehan!</Text>
          </ImageBackground>
        </View>

        <View style={styles.routeCard}>
          <Text style={styles.routeTitle}>Route Assigned</Text>
          <View style={styles.routeRow}>
            <Text style={styles.labelBold}>Route name:&nbsp;</Text>
            <Text style={styles.valuePlain}>Deniyaya</Text>
          </View>
          <View style={styles.routeRow}>
            <Text style={styles.labelBold}>Vehicle:&nbsp;</Text>
            <Text style={styles.valuePlain}>Isuki T245y</Text>
            <TouchableOpacity
              style={[
                styles.pickedBtn,
                pickedState.vehicle && styles.pickedBtnActive,
              ]}
              onPress={() =>
                setPickedState(s => ({ ...s, vehicle: !s.vehicle }))
              }
            >
              <Text
                style={[
                  styles.pickedBtnTxt,
                  !pickedState.vehicle && styles.pickedBtnTxtInactive,
                ]}
              >
                {pickedState.vehicle ? 'Picked up' : 'Pick up'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.routeRow}>
            <Text style={styles.labelBold}>No of bags:&nbsp;</Text>
            <Text style={styles.valuePlain}>52</Text>
            <TouchableOpacity
              style={[
                styles.pickedBtn,
                pickedState.bags && styles.pickedBtnActive,
              ]}
              onPress={() =>
                setPickedState(s => ({ ...s, bags: !s.bags }))
              }
            >
              <Text
                style={[
                  styles.pickedBtnTxt,
                  !pickedState.bags && styles.pickedBtnTxtInactive,
                ]}
              >
                {pickedState.bags ? 'Picked up' : 'Pick up'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.routeRow}>
            <Text style={styles.labelBold}>Fertilizer:&nbsp;</Text>
            <Text style={styles.valuePlain}>6 Urea</Text>
            <TouchableOpacity
              style={[
                styles.pickedBtn,
                pickedState.fertilizer && styles.pickedBtnActive,
              ]}
              onPress={() =>
                setPickedState(s => ({ ...s, fertilizer: !s.fertilizer }))
              }
            >
              <Text
                style={[
                  styles.pickedBtnTxt,
                  !pickedState.fertilizer && styles.pickedBtnTxtInactive,
                ]}
              >
                {pickedState.fertilizer ? 'Picked up' : 'Pick up'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.routeRow}>
            <Text style={styles.labelBold}>Cheques:&nbsp;</Text>
            <Text style={styles.valuePlain}>Rs 300000</Text>
            <TouchableOpacity
              style={[
                styles.pickedBtn,
                pickedState.cheques && styles.pickedBtnActive,
              ]}
              onPress={() =>
                setPickedState(s => ({ ...s, cheques: !s.cheques }))
              }
            >
              <Text
                style={[
                  styles.pickedBtnTxt,
                  !pickedState.cheques && styles.pickedBtnTxtInactive,
                ]}
              >
                {pickedState.cheques ? 'Picked up' : 'Pick up'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.suppliersCard}
          onPress={() => setSupplierModalVisible(true)}
        >
          <Text style={styles.suppliersCardTitle}>Todays suppliers:</Text>
          <Text style={styles.suppliersCardNum}>23</Text>
          <Text style={styles.suppliersCardView}>Tap to view</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.startTripBtn,
            !allPicked && { backgroundColor: '#ddd' },
          ]}
          disabled={!allPicked}
          onPress={() => router.push('/(role)/(driver)/(nontabs)/trip')}
        >
          <Text
            style={[
              styles.startTripBtnText,
              !allPicked && { color: '#888' },
            ]}
          >
            Start Trip
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ✅ FIXED: Supplier List Modal */}
      <Modal
        visible={supplierModalVisible && !selectedSupplier}
        transparent
        animationType="slide"
        onRequestClose={() => setSupplierModalVisible(false)}
      >
        <OutsidePressHandler
          onPress={() => setSupplierModalVisible(false)}
          align="bottom"
        >
          <View style={styles.modalContentList}>
            <Text style={styles.modalSupHeader}>Today's Suppliers</Text>
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchBar}
                placeholder="Search supplier"
                placeholderTextColor="#888"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
            <ScrollView style={{ width: '100%' }}>
              {filteredSuppliers.map(supplier => (
                <TouchableOpacity
                  key={supplier.id}
                  style={styles.supplierRow}
                  onPress={() => {
                    setSelectedSupplier(supplier);
                    setSupplierModalVisible(false);
                  }}
                >
                  <Image source={supplier.image} style={styles.supplierAvatar} />
                  <Text style={styles.supplierName}>{supplier.name}</Text>
                  <Text style={styles.supplierBags}>{supplier.bags} Bags</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </OutsidePressHandler>
      </Modal>

      {/* ✅ Already Correct: Supplier Detail Modal */}
      <Modal
        visible={!!selectedSupplier}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedSupplier(null)}
      >
        <OutsidePressHandler
          onPress={() => setSelectedSupplier(null)}
          align="bottom"
        >
          <View style={{ width: '100%' }}>
            <View style={styles.profileModalSheet}>
              <View style={styles.profileHeader}>
                <Image
                  source={selectedSupplier?.image}
                  style={styles.profileAvatar}
                />
                <View style={styles.profileHeaderInfo}>
                  <Text style={styles.profileName}>
                    {selectedSupplier?.name}
                  </Text>
                </View>
              </View>
              <View style={styles.profileDetailsCard}>
                <Text style={styles.profileInfoLabel}>Bags Supplied</Text>
                <Text style={styles.profileInfoValue}>
                  {selectedSupplier?.bags} Bags
                </Text>
              </View>
            </View>
          </View>
        </OutsidePressHandler>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  heroCard: {
    marginHorizontal: 5,
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eaf2ea',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  heroImg: {
    width: '100%',
    height: 150,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  hello: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginLeft: 20,
    textShadowColor: '#0006',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  routeCard: {
    backgroundColor: '#eaf2ea',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
  },
  routeTitle: {
    fontSize: 20,
    color: '#183d2b',
    fontWeight: '700',
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  labelBold: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
  },
  valuePlain: {
    color: '#222',
    fontSize: 15,
    fontWeight: '400',
  },
  pickedBtn: {
    backgroundColor: '#cddbd1',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginLeft: 'auto',
  },
  pickedBtnActive: {
    backgroundColor: '#183d2b',
  },
  pickedBtnTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff', // Default white for "Picked up"
  },
  pickedBtnTxtInactive: {
    color: '#222', // Black for inactive/light button
  },
  suppliersCard: {
    backgroundColor: '#eaf2ea',
    marginHorizontal: 18,
    marginTop: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    elevation: 2,
    minHeight: 60,
  },
  suppliersCardTitle: {
    fontSize: 17,
    color: '#254b39',
    fontWeight: '700',
    marginBottom: 2,
  },
  suppliersCardNum: {
    fontSize: 34,
    color: '#183d2b',
    fontWeight: '700',
  },
  suppliersCardView: {
    fontSize: 13,
    color: '#888',
    marginTop: -6,
  },
  startTripBtn: {
    backgroundColor: '#183d2b',
    borderRadius: 24,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 40,
    marginTop: 20,
  },
  startTripBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.22)',
    justifyContent: 'flex-end',
  },
  modalContentList: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
    maxHeight: '80%',
    width: '100%',
    alignSelf: 'flex-end',
  },
  modalSupHeader: {
    fontSize: 22,
    color: '#254b39',
    fontWeight: '700',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  searchBarContainer: {
    width: '100%',
    marginBottom: 8,
    backgroundColor: '#f4f8f4',
    borderRadius: 12,
    paddingHorizontal: 5,
  },
  searchBar: {
    width: '100%',
    fontSize: 16,
    color: '#183d2b',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eaf2ea',
    width: '100%',
  },
  supplierAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
    backgroundColor: '#eee',
  },
  supplierName: {
    fontSize: 17,
    color: '#183d2b',
    flex: 1,
    fontWeight: '500',
  },
  supplierBags: {
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
    marginLeft: 10,
  },
  profileModalContent: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 0,
  },
  profileHeader: {
    width: '100%',
    backgroundColor: '#183d2b',
    paddingTop: 32,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 12,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginLeft: 15,
    marginTop: 4,
    backgroundColor: '#eee',
  },
  profileHeaderInfo: {
    marginLeft: 20,
    marginTop: 18,
    flex: 1,
  },
  profileName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  profileDetailsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    alignItems: 'center',
    marginBottom: 14,
  },
  profileInfoLabel: {
    color: '#183d2b',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  profileInfoValue: {
    color: '#183d2b',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  profileBtnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    width: '100%',
  },
  profileModalSheet: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingBottom: 30,
  paddingHorizontal: 24,
  paddingTop: 16,
},
});
