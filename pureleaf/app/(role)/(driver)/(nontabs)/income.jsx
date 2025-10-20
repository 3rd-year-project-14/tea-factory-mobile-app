import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { usePullToRefresh } from "../../../../hooks/usePullToRefresh";
import { getDailySummary } from "../../../../services/supplierService";
import { getWeightsSummary } from "../../../../services/driverService";
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(39, 78, 58, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  decimalPlaces: 0,
};

const monthsArray = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const currentMonthIndex = new Date().getMonth();
const months = [
  ...monthsArray.slice(currentMonthIndex),
  ...monthsArray.slice(0, currentMonthIndex),
];

export default function IncomeScreen() {
  const [selectedMonth, setSelectedMonth] = useState(0); // Now 0 is current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summaryData, setSummaryData] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [driverId, setDriverId] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    const actualMonth = (currentMonthIndex + selectedMonth) % 12;
    try {
      // ensure we have driverId
      let _driverId = driverId;
      if (!_driverId) {
        const driverDataStr = await AsyncStorage.getItem('driverData');
        if (driverDataStr) {
          try {
            const driverData = JSON.parse(driverDataStr);
            _driverId = driverData.id || driverData.driverId || driverData._id || _driverId;
            setDriverId(_driverId);
          } catch (e) {}
        }
      }

      if (!_driverId) {
        throw new Error('Driver ID not found in local storage');
      }

      const [summaryResponse, dailyResponse] = await Promise.all([
        getWeightsSummary(_driverId, actualMonth, selectedYear),
        getDailySummary(_driverId, actualMonth, selectedYear),
      ]);

      // supplier service returns axios response; driverService.getWeightsSummary returns axios promise too
      setSummaryData(summaryResponse.data || summaryResponse);
      setDailyData(dailyResponse.data || dailyResponse);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedMonth, selectedYear]);

  const { refreshing, onRefresh } = usePullToRefresh(refreshData);

  const totalKg = summaryData?.totalGrossWeight || 0;
  const totalIncome = summaryData?.totalNetWeight || 0;

  const conditions = ["Wet", "Coarse", "BagWeight", "Good"];
  const conditionValues = {
    Wet: summaryData?.totalWet || 0,
    Coarse: summaryData?.totalCoarse || 0,
    BagWeight: summaryData?.totalTareWeight || 0,
    Good: summaryData?.totalNetWeight || 0,
  };

  const pieConditionData = conditions
    .map((cond, i) => ({
      name: cond,
      population: conditionValues[cond],
      color: ["#A8E6CF", "#56B870", "#FFD700", "#2E7D32"][i],
      legendFontColor: "#274C3C",
      legendFontSize: 14,
    }))
    .filter((item) => item.population > 0);

  // Calculate totals from daily data
  const totalBags = dailyData.reduce((sum, item) => sum + item.bagCount, 0);
  const totalGross = dailyData.reduce((sum, item) => sum + item.grossWeight, 0);
  const totalNet = dailyData.reduce((sum, item) => sum + item.netWeight, 0);
  const totalWater = dailyData.reduce((sum, item) => sum + item.water, 0);
  const totalCoarse = dailyData.reduce((sum, item) => sum + item.coarseLeaf, 0);
  const totalBagWeight = dailyData.reduce(
    (sum, item) => sum + item.bagWeight,
    0
  );

  function renderTable() {
    if (dailyData.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Ionicons name="calendar-outline" size={48} color="#AAB8A9" />
          <Text style={styles.noDataText}>
            No daily data available for the selected month
          </Text>
        </View>
      );
    }

    return (
      <ScrollView horizontal style={{ marginBottom: 100 }}>
        <View style={styles.tableWrapper}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Day</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Bag Count</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>
              Gross Weight
            </Text>
            <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>
              Net Weight
            </Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Water</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>
              Coarse Leaf
            </Text>
            <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>
              Bag Weight
            </Text>
          </View>
          {dailyData.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={[styles.tableCell, { flex: 1 }]}>{item.day}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {item.bagCount}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.2 }]}>
                {item.grossWeight} kg
              </Text>
              <Text style={[styles.tableCell, { flex: 1.2 }]}>
                {item.netWeight} kg
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {item.water} kg
              </Text>
              <Text style={[styles.tableCell, { flex: 1.2 }]}>
                {item.coarseLeaf} kg
              </Text>
              <Text style={[styles.tableCell, { flex: 1.2 }]}>
                {item.bagWeight} kg
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F8F4" }}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Supply Analytics</Text>

        {loading && (
          <ActivityIndicator
            size="large"
            color="#274C3C"
            style={{ marginVertical: 20 }}
          />
        )}

        {/* Month and Year Filter */}
        <View style={styles.filterContainer}>
          <View style={styles.yearSelector}>
            <TouchableOpacity
              onPress={() => setSelectedYear(selectedYear - 1)}
              style={styles.yearButton}
            >
              <Ionicons name="chevron-back" size={24} color="#274C3C" />
            </TouchableOpacity>
            <Text style={styles.yearText}>{selectedYear}</Text>
            <TouchableOpacity
              onPress={() => setSelectedYear(selectedYear + 1)}
              style={styles.yearButton}
            >
              <Ionicons name="chevron-forward" size={24} color="#274C3C" />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.monthScroll}
          >
            {months.map((month, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedMonth(index)}
                style={[
                  styles.monthButton,
                  selectedMonth === index && styles.selectedMonth,
                ]}
              >
                <Text
                  style={[
                    styles.monthText,
                    selectedMonth === index && styles.selectedMonthText,
                  ]}
                >
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="cube-outline" size={26} color="#263A29" />
            <Text style={styles.summaryLabel}>Total Gross Weight</Text>
            <Text style={styles.summaryValue}>{totalGross} kg</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="wallet-outline" size={26} color="#263A29" />
            <Text style={styles.summaryLabel}>Total Net Weight</Text>
            <Text style={styles.summaryValue}>{totalNet} kg</Text>
          </View>
        </View>

        {/* Charts */}
        <Text style={styles.sectionTitle}>Analytics</Text>

        <Text style={styles.chartLabel}>Entry Condition Distribution</Text>
        {pieConditionData.length > 0 ? (
          <PieChart
            data={pieConditionData}
            width={screenWidth * 0.95}
            height={190}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <Text style={styles.noDataText}>
            No data available for selected period
          </Text>
        )}

        {/* Table */}
        <Text style={styles.sectionTitle}>Supply History</Text>
        {renderTable()}

        {/* Table Summary */}
        <Text style={styles.sectionTitle}>Monthly Totals</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="bag-outline" size={26} color="#263A29" />
            <Text style={styles.summaryLabel}>Total Bags</Text>
            <Text style={styles.summaryValue}>{totalBags}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="cube-outline" size={26} color="#263A29" />
            <Text style={styles.summaryLabel}>Total Gross</Text>
            <Text style={styles.summaryValue}>{totalGross} kg</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="scale-outline" size={26} color="#263A29" />
            <Text style={styles.summaryLabel}>Total Net</Text>
            <Text style={styles.summaryValue}>{totalNet} kg</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="water-outline" size={26} color="#263A29" />
            <Text style={styles.summaryLabel}>Total Water</Text>
            <Text style={styles.summaryValue}>{totalWater} kg</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="leaf-outline" size={26} color="#263A29" />
            <Text style={styles.summaryLabel}>Total Coarse</Text>
            <Text style={styles.summaryValue}>{totalCoarse} kg</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="bag-handle-outline" size={26} color="#263A29" />
            <Text style={styles.summaryLabel}>Total Bag Weight</Text>
            <Text style={styles.summaryValue}>{totalBagWeight} kg</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 100 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#274C3C",
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#E7EDEB",
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 6,
    alignItems: "center",
    shadowColor: "#AAB8A9",
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 4,
  },
  summaryLabel: { fontSize: 15, color: "#274C3C", marginTop: 6 },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B5E20",
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#274C3C",
    marginBottom: 14,
    marginTop: 30,
  },
  chartLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 10,
    color: "#274C3C",
  },

  tableWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#C4DFCB",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 600,
    borderWidth: 1,
    borderColor: "#C0D1C2",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderColor: "#A5B6AE",
    paddingVertical: 12,
    backgroundColor: "#E7EDEB",
  },
  tableHeaderText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#274C3C",
    textAlign: "center",
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#EBEFED",
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  tableCell: {
    fontSize: 15,
    fontWeight: "500",
    color: "#274C3C",
    textAlign: "center",
    paddingHorizontal: 6,
  },
  filterContainer: {
    marginBottom: 20,
  },
  yearSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  yearButton: {
    padding: 10,
  },
  yearText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#274C3C",
    marginHorizontal: 20,
  },
  monthScroll: {
    marginHorizontal: 20,
  },
  monthButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#E7EDEB",
  },
  selectedMonth: {
    backgroundColor: "#274C3C",
  },
  monthText: {
    fontSize: 16,
    color: "#274C3C",
  },
  selectedMonthText: {
    color: "#fff",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#274C3C",
    marginVertical: 20,
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    marginBottom: 100,
  },
});
