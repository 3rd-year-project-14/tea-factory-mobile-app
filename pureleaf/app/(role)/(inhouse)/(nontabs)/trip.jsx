// Trip.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

// 6 Sri Lankan supplier samples
const suppliers = [
  {
    id: 1,
    name: 'Malikanthi Perera',
    code: 'T-101',
    bags: 7,
    image: require('../../../../assets/images/propic.jpg'),
    phone: '0771234567',
    fertilizer: 2,
    fertilizerType: 'urea',
    address: 'No. 45, Temple Road, Gampaha'
  },
  {
    id: 2,
    name: 'Saman Kumara',
    code: 'T-102',
    bags: 10,
    image: require('../../../../assets/images/propic.jpg'),
    phone: '0712345678',
    fertilizer: 3,
    fertilizerType: 'urea',
    address: '23/1, Lake View, Kandy'
  },
  {
    id: 3,
    name: 'Amal Silva',
    code: 'T-103',
    bags: 5,
    image: require('../../../../assets/images/propic.jpg'),
    phone: '0758765432',
    fertilizer: 1,
    fertilizerType: 'urea',
    address: '12, Main Street, Matara'
  },
  {
    id: 4,
    name: 'Nirosha Fernando',
    code: 'T-104',
    bags: 8,
    image: require('../../../../assets/images/propic.jpg'),
    phone: '0723344556',
    fertilizer: 2,
    fertilizerType: 'urea',
    address: '90, Beach Road, Negombo'
  },
  {
    id: 5,
    name: 'Ruwan Jayasinghe',
    code: 'T-105',
    bags: 6,
    image: require('../../../../assets/images/propic.jpg'),
    phone: '0769988776',
    fertilizer: 2,
    fertilizerType: 'urea',
    address: '15, Hill Top, Badulla'
  },
  {
    id: 6,
    name: 'Kumudu Ranatunga',
    code: 'T-106',
    bags: 9,
    image: require('../../../../assets/images/propic.jpg'),
    phone: '0781122334',
    fertilizer: 3,
    fertilizerType: 'urea',
    address: '7, Station Road, Kurunegala'
  },
];

export default function Trip() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchText.toLowerCase())
  );
  const [currentSupplier, setCurrentSupplier] = useState(filteredSuppliers[0] || suppliers[0]);
  const [arrived, setArrived] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (searchText && filteredSuppliers.length > 0) {
      setCurrentSupplier(filteredSuppliers[0]);
      setArrived(false);
    }
  }, [searchText]);

  useEffect(() => {
    setArrived(false);
  }, [currentSupplier]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f8f4' }}>
      {/* Map Section with Supplier Details Overlay */}
      <View style={styles.mapSection}>
        <Image
          source={require('../../../../assets/images/map.jpg')}
          style={styles.mapImage}
          resizeMode="cover"
        />
        <View style={styles.mapOverlay}>
          <Text style={styles.supplierCode}>{currentSupplier.code}</Text>
          <Text style={styles.supplierName}>{currentSupplier.name}</Text>
          <View style={styles.overlayInfoRow}>
            <Ionicons name="location-sharp" size={18} color="#183d2b" style={{ marginRight: 5 }} />
            <Text style={styles.supplierAddress}>{currentSupplier.address}</Text>
          </View>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${currentSupplier.phone}`)}
          >
            <Ionicons name="call" size={20} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.callBtnText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.goBtn}
            onPress={() => {
              if (!arrived) {
                setArrived(true);
              } else {
                router.push('/(role)/(driver)/(nontabs)/pickup')
              }
            }}
          >
            <Text style={styles.goBtnText}>{arrived ? 'Arrived' : 'GO'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Trips List */}
      <ScrollView style={{ flex: 1 }}>
        <Text style={styles.upcomingTripsLabel}>Upcoming Trips</Text>
        {filteredSuppliers.map((supplier) => (
          <TouchableOpacity
            key={supplier.id}
            style={[
              styles.supplierListRow,
              currentSupplier.id === supplier.id && styles.supplierListRowActive,
            ]}
            onPress={() => {
              setCurrentSupplier(supplier);
              setArrived(false);
            }}
          >
            <Image source={supplier.image} style={styles.supplierAvatar} />
            <View>
              <Text style={styles.listSupplierName}>{supplier.name}</Text>
              <Text style={styles.listSupplierBags}>{supplier.bags} Bags</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapSection: {
    width: '100%',
    height: 260,
    position: 'relative',
    marginBottom: 10,
  },
  mapImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 18,
    padding: 16,
    alignItems: 'flex-start',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  supplierCode: {
    color: '#183d2b',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 2,
  },
  supplierName: {
    color: '#183d2b',
    fontWeight: '700',
    fontSize: 19,
    marginBottom: 2,
  },
  overlayInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  supplierAddress: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  overlayInfoLabel: {
    color: '#888',
    fontSize: 15,
    fontWeight: '500',
    marginRight: 2,
  },
  overlayInfoValue: {
    color: '#183d2b',
    fontWeight: '700',
    fontSize: 15,
    marginRight: 12,
  },
  goBtn: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: '#183d2b',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginTop: 8,
  },
  goBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#183d2b',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  callBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  upcomingTripsLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#183d2b',
    marginLeft: 18,
    marginTop: 4,
    marginBottom: 8,
  },
  supplierListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 14,
    marginVertical: 6,
    borderRadius: 14,
    padding: 12,
    elevation: 1,
  },
  supplierListRowActive: {
    borderColor: '#183d2b',
    borderWidth: 2,
    backgroundColor: '#eaf2ea',
  },
  supplierAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 14,
    backgroundColor: '#eee',
  },
  listSupplierName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#183d2b',
  },
  listSupplierBags: {
    fontSize: 13,
    color: '#666',
  },
});
