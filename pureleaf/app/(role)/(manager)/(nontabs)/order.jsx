import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, FlatList, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

const fertilizerTypes = [
  {
    id: 1,
    name: 'Urea',
    image: require('../../../../assets/images/fert1.jpg'),
    price: 1000,
    unit: '50kg'
  },
  {
    id: 2,
    name: 'Ammonium sulfate',
    image: require('../../../../assets/images/fert2.jpg'),
    price: 1200,
    unit: '50kg'
  },
  {
    id: 3,
    name: 'Urea',
    image: require('../../../../assets/images/fert1.jpg'),
    price: 1000,
    unit: '50kg'
  },
  {
    id: 4,
    name: 'Ammonium sulfate',
    image: require('../../../../assets/images/fert2.jpg'),
    price: 1200,
    unit: '50kg'
  },
  {
    id: 5,
    name: 'Urea',
    image: require('../../../../assets/images/fert1.jpg'),
    price: 1000,
    unit: '50kg'
  },
  {
    id: 6,
    name: 'Ammonium sulfate',
    image: require('../../../../assets/images/fert2.jpg'),
    price: 1200,
    unit: '50kg'
  },
];

export default function FertilizerOrderPage() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [order, setOrder] = useState([]);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedFertilizer, setSelectedFertilizer] = useState(null);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const filteredFertilizers = fertilizerTypes.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const subTotal = order.reduce((sum, item) => sum + item.total, 0);

  // Add to order
  const handleAddToOrder = () => {
    if (!selectedFertilizer || quantity < 1) return;
    const exists = order.find(item => item.fertilizer.id === selectedFertilizer.id);
    let newOrder;
    if (exists) {
      newOrder = order.map(item =>
        item.fertilizer.id === selectedFertilizer.id
          ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.fertilizer.price }
          : item
      );
    } else {
      newOrder = [
        ...order,
        {
          fertilizer: selectedFertilizer,
          quantity,
          total: quantity * selectedFertilizer.price,
        },
      ];
    }
    setOrder(newOrder);
    setQuantity(1);
    setSelectedFertilizer(null);
    setQuantityModalVisible(false);
  };

  // Edit order item
  const handleEditOrder = () => {
    if (!selectedOrderItem || quantity < 1) return;
    const newOrder = order.map(item =>
      item.fertilizer.id === selectedOrderItem.fertilizer.id
        ? { ...item, quantity, total: quantity * item.fertilizer.price }
        : item
    );
    setOrder(newOrder);
    setQuantity(1);
    setSelectedOrderItem(null);
    setEditModalVisible(false);
  };

  // Remove order item
  const handleRemoveOrder = () => {
    if (!selectedOrderItem) return;
    setOrder(order.filter(item => item.fertilizer.id !== selectedOrderItem.fertilizer.id));
    setQuantity(1);
    setSelectedOrderItem(null);
    setEditModalVisible(false);
  };

  // Open add modal
  const openAddModal = fert => {
    setSelectedFertilizer(fert);
    setQuantity(1);
    setQuantityModalVisible(true);
  };

  // Open edit modal
  const openEditModal = item => {
    setSelectedOrderItem(item);
    setQuantity(item.quantity);
    setEditModalVisible(true);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Place Fertilizer Order</Text>

        {/* Search Bar */}
        <TextInput
          placeholder="search"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#888"
          style={styles.searchInput}
        />

        {/* Fertilizer Types Slider */}
        <ScrollView horizontal style={styles.sliderRow} showsHorizontalScrollIndicator={false}>
          {filteredFertilizers.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={styles.fertilizerCard}
              onPress={() => openAddModal(item)}
            >
              <Image source={item.image} style={styles.fertilizerImage} />
              <View style={styles.fertilizerLabelOverlay}>
                <Text style={styles.fertilizerLabelOverlayText}>{item.name}</Text>
              </View>
              <Text style={styles.fertPrice}>Rs.{item.price}.00</Text>
              <Text style={styles.fertUnit}>{item.unit}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Order Table */}
        <View style={styles.orderTable}>
          <View style={styles.orderTableHeader}>
            <Text style={styles.orderTableHeaderCell}>No</Text>
            <Text style={[styles.orderTableHeaderCell, { flex: 2 }]}>Name</Text>
            <Text style={styles.orderTableHeaderCell}>Quantity</Text>
            <Text style={styles.orderTableHeaderCell}>Total (Rs)</Text>
          </View>
          <FlatList
            data={order}
            keyExtractor={item => item.fertilizer.id.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.orderTableRow}
                onPress={() => openEditModal(item)}
              >
                <Text style={styles.orderTableCell}>{index + 1}</Text>
                <Text style={[styles.orderTableCell, { flex: 2 }]}>{item.fertilizer.name} {item.fertilizer.unit}</Text>
                <Text style={styles.orderTableCell}>{item.quantity}</Text>
                <Text style={styles.orderTableCell}>{item.total}.00</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 8 }}>No items added yet</Text>}
          />
          <View style={styles.orderTableFooter}>
            <Text style={[styles.orderTableFooterCell, { flex: 3, textAlign: 'right' }]}>Sub Total</Text>
            <Text style={[styles.orderTableFooterCell, { flex: 1, textAlign: 'right' }]}>{subTotal}.00</Text>
          </View>
        </View>

        <TouchableOpacity
  style={styles.placeOrderButton}
  onPress={() => {
    // ...any logic you want before redirecting...
   router.replace('/(role)/(manager)/fertilizer');
   
// Use replace to prevent going back to order page
  }}
>
  <Text style={styles.placeOrderButtonText}>Place Order</Text>
</TouchableOpacity>

      </View>

      {/* Quantity Selector Modal */}
      <Modal
        visible={quantityModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setQuantityModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setQuantityModalVisible(false)}>
          <View style={styles.modalContent}>
            {selectedFertilizer && (
              <>
                <Text style={styles.modalTitle}>{selectedFertilizer.name}</Text>
                <Image source={selectedFertilizer.image} style={styles.modalImage} />
                <Text style={styles.modalPrice}>Price : Rs.{selectedFertilizer.price}.00</Text>
                <Text style={styles.modalUnit}>Unit weight : {selectedFertilizer.unit}</Text>
                <View style={styles.qtyRow}>
                  <Text style={styles.qtyLabel}>Quantity</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity(q => q + 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalTotal}>Total : Rs.{quantity * selectedFertilizer.price}.00</Text>
                <TouchableOpacity style={styles.addBtn} onPress={handleAddToOrder}>
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Edit/Remove Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEditModalVisible(false)}>
          <View style={styles.modalContent}>
            {selectedOrderItem && (
              <>
                <Text style={styles.modalTitle}>{selectedOrderItem.fertilizer.name}</Text>
                <Image source={selectedOrderItem.fertilizer.image} style={styles.modalImage} />
                <Text style={styles.modalPrice}>Price : Rs.{selectedOrderItem.fertilizer.price}.00</Text>
                <Text style={styles.modalUnit}>Unit weight : {selectedOrderItem.fertilizer.unit}</Text>
                <View style={styles.qtyRow}>
                  <Text style={styles.qtyLabel}>Quantity</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity(q => q + 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalTotal}>Total : Rs.{quantity * selectedOrderItem.fertilizer.price}.00</Text>
                <View style={styles.editBtnRow}>
                  <TouchableOpacity style={[styles.addBtn, { flex: 1, marginRight: 8 }]} onPress={handleEditOrder}>
                    <Text style={styles.addBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.removeBtn, { flex: 1, marginLeft: 8 }]} onPress={handleRemoveOrder}>
                    <Text style={styles.addBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const CARD_WIDTH = 150;
const CARD_HEIGHT = 190;
const OVERLAY_HEIGHT = 38;

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f4f8f4',
    flexGrow: 1,
    // flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    alignSelf: 'flex-start',
    marginBottom: 12,
    marginLeft: 2,
  },
  searchInput: {
    backgroundColor: '#eaf2ea',
    borderRadius: 20,
    padding: 10,
    marginVertical: 8,
    fontSize: 16,
    color: '#222',
  },
  sliderRow: {
    width: '100%',
    height: CARD_HEIGHT+20 ,
    //  marginBottom: 8,
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
    marginBottom: 8,
  },
  fertilizerImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT - 38,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: 'cover',
  },
  fertilizerLabelOverlay: {
    position: 'absolute',
    bottom: 38,
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
  fertPrice: {
    fontSize: 15,
    color: '#222',
    marginTop: 2,
    fontWeight: '500',
  },
  fertUnit: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  orderTable: {
    backgroundColor: '#fff',
    borderRadius: 12,
     marginTop: 10,
    padding: 8,
    marginBottom: 20,
    // flex: 1,
  },
  orderTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 4,
  },
  orderTableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
  },
  orderTableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  orderTableCell: {
    flex: 1,
    color: '#222',
    fontSize: 15,
  },
  orderTableFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#eee',
    marginTop: 8,
    paddingTop: 8,
  },
  orderTableFooterCell: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
  },
  placeOrderButton: {
    backgroundColor: '#183d2b',
    borderRadius: 40,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
    alignSelf: 'center',
    marginBottom: 20,
    elevation: 2,
    paddingHorizontal: 40,
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '600',
    letterSpacing: 1,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalImage: {
    width: 140,
    height: 110,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalPrice: {
    fontSize: 15,
    marginBottom: 2,
    color: '#183d2b',
  },
  modalUnit: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    justifyContent: 'center',
  },
  qtyLabel: {
    fontSize: 16,
    marginRight: 10,
    color: '#222',
  },
  qtyBtn: {
    backgroundColor: '#eaf2ea',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#183d2b',
  },
  qtyValue: {
    fontSize: 18,
    marginHorizontal: 6,
    color: '#222',
  },
  modalTotal: {
    fontSize: 16,
    marginBottom: 12,
    color: '#222',
    fontWeight: 'bold',
  },
  addBtn: {
    backgroundColor: '#183d2b',
    borderRadius: 40,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 36,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  removeBtn: {
    backgroundColor: '#590804',
    borderRadius: 40,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 36,
  },
  editBtnRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 8,
  },
});
