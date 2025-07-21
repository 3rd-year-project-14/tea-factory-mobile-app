// app/usage.jsx
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dummy data
const usageData = [
  {
    id: '1',
    date: '2025-07-02',
    type: 'Urea',
    quantity: '25kg',
    cost: 'Rs 3,500',
    status: 'Delivered',
  },
  {
    id: '2',
    date: '2025-07-12',
    type: 'Ammonium Sulfate',
    quantity: '15kg',
    cost: 'Rs 2,100',
    status: 'Pending',
  },
];

export default function UsageScreen() {
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const types = ['All', ...new Set(usageData.map(i => i.type))];
  const statuses = ['All', ...new Set(usageData.map(i => i.status))];

  const filteredData = usageData.filter(
    item =>
      (selectedType === 'All' || item.type === selectedType) &&
      (selectedStatus === 'All' || item.status === selectedStatus)
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F8F4' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Usage History</Text>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="leaf-outline" size={22} color="#263A29" />
            <Text style={styles.summaryLabel}>Total Used</Text>
            <Text style={styles.summaryValue}>40kg</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="cash-outline" size={22} color="#263A29" />
            <Text style={styles.summaryLabel}>Total Cost</Text>
            <Text style={styles.summaryValue}>Rs 5,600</Text>
          </View>
        </View>

        {/* Filters */}
        <View>
          <Text style={styles.filterHeader}>Filter by Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {types.map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterBtn,
                  selectedType === type && styles.selectedFilterBtn
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[styles.filterText, selectedType === type && styles.selectedFilterText]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.filterHeader, { marginTop: 20 }]}>Filter by Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {statuses.map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterBtn,
                  selectedStatus === status && styles.selectedFilterBtn
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text style={[styles.filterText, selectedStatus === status && styles.selectedFilterText]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Usage Table Heading */}
        <Text style={styles.sectionTitle}>Usage Details</Text>

        {/* Table Rows */}
        {filteredData.map((item, index) => (
          <View key={item.id} style={styles.tableCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{item.date}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Type</Text>
              <Text style={styles.value}>{item.type}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Quantity</Text>
              <Text style={styles.value}>{item.quantity}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Cost</Text>
              <Text style={styles.value}>{item.cost}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Status</Text>
              <Text style={[
                styles.value,
                { color: item.status === 'Delivered' ? '#2D7728' : '#CD6D00' }
              ]}>
                {item.status}
              </Text>
            </View>
          </View>
        ))}

        {/* Action Button */}
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#263A29',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 30,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#E3EDE2',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#AAC8A7',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#263A29',
    marginTop: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
  },
  filterHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#263A29',
    marginBottom: 6,
    marginLeft: 2,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 8,
    paddingBottom: 2,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#E3EDE2',
    borderRadius: 20,
  },
  filterText: {
    color: '#263A29',
    fontWeight: '500',
  },
  selectedFilterBtn: {
    backgroundColor: '#183D2B',
  },
  selectedFilterText: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#183D2B',
    marginBottom: 12,
    marginTop: 20,
  },
  tableCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#AAC8A7',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
    color: '#5C5C5C',
  },
  value: {
    fontWeight: '500',
    color: '#263A29',
  },
  primaryBtn: {
    marginTop: 20,
    backgroundColor: '#183D2B',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});