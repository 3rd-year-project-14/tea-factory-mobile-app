import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePullToRefresh } from "../../../../hooks/usePullToRefresh";

const supplyData = [
  {
    id: "1",
    date: "2025-07-01",
    kg: 22,
    income: 3200,
    status: "Delivered",
    condition: "Good",
  },
  {
    id: "2",
    date: "2025-07-05",
    kg: 17,
    income: 2500,
    status: "Pending",
    condition: "Coarse",
  },
  {
    id: "3",
    date: "2025-07-10",
    kg: 10,
    income: 1600,
    status: "Delivered",
    condition: "Wet",
  },
  {
    id: "4",
    date: "2025-07-15",
    kg: 14.5,
    income: 2100,
    status: "Delivered",
    condition: "Good",
  },
  {
    id: "5",
    date: "2025-07-20",
    kg: 18,
    income: 2800,
    status: "Pending",
    condition: "Coarse",
  },
];

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(39, 78, 58, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  decimalPlaces: 0,
};

export default function IncomeScreen() {
  const refreshData = async () => {
    // For static data, no refresh needed, but keeping for consistency
  };

  const { refreshing, onRefresh } = usePullToRefresh(refreshData);

  const filteredData = [...supplyData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const totalKg = filteredData.reduce((acc, item) => acc + item.kg, 0);
  const totalIncome = filteredData.reduce((acc, item) => acc + item.income, 0);

  const conditions = ["Wet", "Coarse", "Good"];
  const conditionCounts = { Wet: 0, Coarse: 0, Good: 0 };
  filteredData.forEach((item) => {
    if (conditionCounts[item.condition] !== undefined)
      conditionCounts[item.condition]++;
  });

  const pieConditionData = conditions.map((cond, i) => ({
    name: cond,
    population: conditionCounts[cond],
    color: ["#A8E6CF", "#56B870", "#2E7D32"][i],
    legendFontColor: "#274C3C",
    legendFontSize: 14,
  }));

  const labels = filteredData.map((item) => item.date.substring(5)); // MM-DD
  const datasets = [{ data: filteredData.map((item) => item.income) }];

  function renderTable() {
    return (
      <ScrollView horizontal style={{ marginBottom: 100 }}>
        <View style={styles.tableWrapper}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 1.3 }]}>Date</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Kg</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.4 }]}>
              Income (Rs.)
            </Text>
            <Text style={[styles.tableHeaderText, { flex: 1.3 }]}>
              Condition
            </Text>
          </View>
          {filteredData.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <Text style={[styles.tableCell, { flex: 1.3 }]}>{item.date}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{item.kg}</Text>
              <Text style={[styles.tableCell, { flex: 1.4 }]}>
                Rs. {item.income}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.3 }]}>
                {item.condition}
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
        <Text style={styles.title}>Supply & Income Analytics</Text>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="cube-outline" size={26} color="#263A29" />
            <Text style={styles.summaryLabel}>Total Supplied</Text>
            <Text style={styles.summaryValue}>{totalKg} kg</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="wallet-outline" size={26} color="#263A29" />
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={styles.summaryValue}>Rs. {totalIncome}</Text>
          </View>
        </View>

        {/* Charts */}
        <Text style={styles.sectionTitle}>Analytics</Text>

        <Text style={styles.chartLabel}>Entry Condition Distribution</Text>
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

        <Text style={[styles.chartLabel, { marginTop: 24 }]}>
          Income Trend (Time Plot)
        </Text>
        <LineChart
          data={{ labels, datasets }}
          width={screenWidth * 0.95}
          height={240}
          chartConfig={chartConfig}
          bezier
          fromZero
          style={{ borderRadius: 18 }}
        />

        {/* Table */}
        <Text style={styles.sectionTitle}>Supply History</Text>
        {renderTable()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
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
});
