import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
export default function Pickup() {
  const [bagNo, setBagNo] = useState('');
  const [quality, setQuality] = useState('Dry');
  const [weight, setWeight] = useState('');
  const [bags, setBags] = useState([]);
  const [delivered, setDelivered] = useState(false);
  const router = useRouter();


  // Sample supplier data
  const supplier = {
    name: 'Saman Kumara',
    address: '12,Galle Road,Neluwa',
    code: 'T-456',
    image: require('../../../../assets/images/propic.jpg'), // Update path as needed
    fertilizer: [
      { type: 'Urea', qty: '50kg', bags: 2 },
      { type: 'Ammonium Sulphate', qty: '50kg', bags: 1 }
    ]
  };

  const addBag = () => {
    if (bagNo && weight) {
      setBags([...bags, { bagNo, quality, weight }]);
      setBagNo('');
      setWeight('');
    }
  };

  const totalWeight = bags.reduce((sum, bag) => sum + Number(bag.weight), 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f8f4' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Supplier Card */}
        <View style={styles.supplierCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={supplier.image} style={styles.avatar} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.supplierCode}>{supplier.code}</Text>
              <Text style={styles.supplierName}>{supplier.name}</Text>
              <Text style={styles.supplierAddress}>{supplier.address}</Text>
            </View>
          </View>
        </View>

        {/* Supply Section */}
        <View style={styles.supplySection}>
          <Text style={styles.sectionTitle}>Supply</Text>
          <View style={styles.formColumn}>
            <TextInput
              style={styles.input}
              placeholder="Bag No"
              placeholderTextColor="#888"
              value={bagNo}
              onChangeText={setBagNo}
              keyboardType="numeric"
            />
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.qualityLabel}>Quality:</Text>
              <View style={styles.qualityToggle}>
                <TouchableOpacity
                  style={[styles.qualityBtn, quality === 'Wet' && styles.qualityBtnActive]}
                  onPress={() => setQuality('Wet')}
                >
                  <Text style={[styles.qualityText, quality === 'Wet' && styles.qualityTextActive]}>Wet</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.qualityBtn, quality === 'Dry' && styles.qualityBtnActive]}
                  onPress={() => setQuality('Dry')}
                >
                  <Text style={[styles.qualityText, quality === 'Dry' && styles.qualityTextActive]}>Dry</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.qualityBtn, quality === 'Good' && styles.qualityBtnActive]}
                  onPress={() => setQuality('Good')}
                >
                  <Text style={[styles.qualityText, quality === 'Good' && styles.qualityTextActive]}>Good</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Weight"
              placeholderTextColor="#888"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.addBtn} onPress={addBag}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bags Table */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.tableHeader}>No</Text>
            <Text style={styles.tableHeader}>Bag No</Text>
            <Text style={styles.tableHeader}>Quality</Text>
            <Text style={styles.tableHeader}>Weight</Text>
          </View>
          {bags.map((bag, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={styles.tableCell}>{(idx + 1).toString().padStart(2, '0')}</Text>
              <Text style={styles.tableCell}>{bag.bagNo}</Text>
              <Text style={styles.tableCell}>{bag.quality}</Text>
              <Text style={styles.tableCell}>{bag.weight}</Text>
            </View>
          ))}
          {/* Fill empty rows for consistent look */}
          {[...Array(5 - bags.length)].map((_, i) => (
            <View style={styles.tableRow} key={bags.length + i}>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}></Text>
            </View>
          ))}
          <View style={styles.totalWeightRow}>
            <Text style={styles.totalWeightLabel}>Total Weight</Text>
            <Text style={styles.totalWeightValue}>{totalWeight.toFixed(2)}</Text>
          </View>
        </View>

        {/* Fertilizer Section */}
        <View style={styles.fertilizerSection}>
          <Text style={styles.fertilizerText}>
            Urea : 50kg {supplier.fertilizer[0].bags} bags{'\n'}
            Ammonium Sulphate : 50kg {supplier.fertilizer[1].bags} bag
          </Text>
          <TouchableOpacity
            style={[styles.deliverBtn, delivered && styles.deliveredBtn]}
            onPress={() => setDelivered(true)}
            disabled={delivered}
          >
            <Text style={styles.deliverBtnText}>
              {delivered ? 'Delivered' : 'Mark as delivered'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

  
<TouchableOpacity
  style={styles.doneBtn}
  onPress={() => router.push('/(role)/(driver)/(nontabs)/trip')}
>
  <Text style={styles.doneBtnText}>Done</Text>
</TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navIcon}>
          <Text>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navIcon}>
          <Text>💰</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navIcon, styles.navIconActive]}>
          <Text>✔️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  supplierCard: {
    backgroundColor: '#183d2b',
    borderRadius: 16,
    margin: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: '#eee',
  },
  supplierCode: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  supplierName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 2,
  },
  supplierAddress: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
  },
  supplySection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#183d2b',
    marginBottom: 8,
  },
  formColumn: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: 18,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  qualityLabel: {
    fontSize: 14,
    color: '#183d2b',
    fontWeight: '600',
    marginBottom: 4,
  },
  qualityToggle: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  qualityBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginRight: 4,
    backgroundColor: '#fff',
  },
  qualityBtnActive: {
    backgroundColor: '#183d2b',
    borderColor: '#183d2b',
  },
  qualityText: {
    color: '#183d2b',
    fontWeight: '600',
    fontSize: 14,
  },
  qualityTextActive: {
    color: '#fff',
  },
  addBtn: {
    backgroundColor: '#183d2b',
    borderRadius: 50,
    paddingVertical: 10,
    width:80,
    paddingHorizontal: 18,
    alignItems:'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#eaf2ea',
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableHeader: {
    flex: 1,
    fontWeight: '700',
    color: '#183d2b',
    fontSize: 14,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  tableCell: {
    flex: 1,
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
  },
  totalWeightRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f7f7f7',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  totalWeightLabel: {
    fontWeight: '700',
    color: '#183d2b',
    fontSize: 15,
    marginRight: 12,
  },
  totalWeightValue: {
    fontWeight: '700',
    color: '#183d2b',
    fontSize: 15,
    minWidth: 60,
    textAlign: 'right',
  },
  fertilizerSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 1,
    alignItems: 'flex-start',
  },
  fertilizerText: {
    fontSize: 15,
    color: '#183d2b',
    marginBottom: 14,
    fontWeight: '500',
  },
  deliverBtn: {
    backgroundColor: '#183d2b',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 6,
  },
  deliveredBtn: {
    backgroundColor: '#183d2b',
  },
  deliverBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  doneBtn: {
    backgroundColor: '#183d2b',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 70,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
  },
  doneBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 1,
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
  },
  navIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  navIconActive: {
    backgroundColor: '#eaf2ea',
  },
});
