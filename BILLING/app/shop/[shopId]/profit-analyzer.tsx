import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { useSales } from "@/hooks/useSales";

type Period = "daily" | "monthly" | "yearly";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const { width } = Dimensions.get("window");

function BarChart({ data, labels, color, maxVal }: { data: number[]; labels: string[]; color: string; maxVal: number }) {
  const chartWidth = width - 48;
  const barWidth = Math.max((chartWidth / data.length) - 8, 20);
  const maxHeight = 120;

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height: maxHeight + 30, gap: 4 }}>
      {data.map((val, i) => {
        const barHeight = maxVal > 0 ? (val / maxVal) * maxHeight : 0;
        return (
          <View key={i} style={{ alignItems: "center", flex: 1 }}>
            <Text style={{ fontSize: 8, color: "#6B7280", marginBottom: 2 }}>
              {val > 0 ? `₹${val > 999 ? (val/1000).toFixed(1)+"k" : val.toFixed(0)}` : ""}
            </Text>
            <View style={{ width: barWidth, height: Math.max(barHeight, 2), backgroundColor: color, borderRadius: 4, opacity: 0.85 }} />
            <Text style={{ fontSize: 8, color: "#6B7280", marginTop: 4 }}>{labels[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function ProfitAnalyzerScreen() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { colors } = useTheme();
  const { sales, loading } = useSales(shopId);
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>("monthly");

  const now = new Date();

  const getDailyProfit = () => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const val = sales.filter((s) => {
      const sd = s.createdAt;
      return sd.getDate() === d.getDate() && sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
    }).reduce((sum, s) => sum + s.totalProfit, 0);
    return { label: `${d.getDate()}/${d.getMonth()+1}`, value: val };
  });

  const getMonthlyProfit = () => Array.from({ length: 12 }, (_, i) => ({
    label: MONTHS[i],
    value: sales.filter((s) => s.createdAt.getFullYear() === now.getFullYear() && s.createdAt.getMonth() === i)
      .reduce((sum, s) => sum + s.totalProfit, 0),
  }));

  const getYearlyProfit = () => {
    const years: Record<number, number> = {};
    sales.forEach((s) => { const y = s.createdAt.getFullYear(); years[y] = (years[y] ?? 0) + s.totalProfit; });
    return Object.entries(years).sort(([a],[b]) => Number(a)-Number(b)).map(([year, value]) => ({ label: year, value }));
  };

  const chartData = period === "daily" ? getDailyProfit() : period === "monthly" ? getMonthlyProfit() : getYearlyProfit();
  const values = chartData.map((d) => d.value);
  const maxVal = Math.max(...values, 1);

  const todayProfit = sales.filter((s) => {
    const d = s.createdAt;
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((sum, s) => sum + s.totalProfit, 0);

  const monthProfit = sales.filter((s) => s.createdAt.getFullYear() === now.getFullYear() && s.createdAt.getMonth() === now.getMonth())
    .reduce((sum, s) => sum + s.totalProfit, 0);

  const yearProfit = sales.filter((s) => s.createdAt.getFullYear() === now.getFullYear())
    .reduce((sum, s) => sum + s.totalProfit, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={["#1A1A2E", "#16213E"]} style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profit Analyzer</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color="#FF6B35" style={{ marginTop: 48 }} size="large" />
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) }]}>
          <View style={styles.statsRow}>
            {[
              { label: "Today", value: `₹${todayProfit.toFixed(0)}`, color: "#10B981" },
              { label: "This Month", value: `₹${monthProfit.toFixed(0)}`, color: "#2EC4B6" },
              { label: "This Year", value: `₹${yearProfit.toFixed(0)}`, color: "#667EEA" },
            ].map((stat) => (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.periodTabs}>
              {(["daily", "monthly", "yearly"] as Period[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.periodTab, period === p && styles.periodTabActive]}
                  onPress={() => setPeriod(p)}
                >
                  <Text style={[styles.periodTabText, { color: period === p ? "#fff" : colors.textSecondary }]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              Profit — {period === "daily" ? "Last 7 Days" : period === "monthly" ? now.getFullYear() : "All Time"}
            </Text>
            {chartData.length > 0 ? (
              <BarChart data={values} labels={chartData.map((d) => String(d.label))} color="#10B981" maxVal={maxVal} />
            ) : (
              <View style={styles.noData}>
                <Ionicons name="analytics-outline" size={48} color={colors.textTertiary} />
                <Text style={[styles.noDataText, { color: colors.textSecondary }]}>No profit data yet</Text>
              </View>
            )}
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Profit Formula</Text>
            <View style={styles.formulaRow}>
              <View style={[styles.formulaBox, { backgroundColor: "#FF6B3520" }]}>
                <Text style={{ fontSize: 12, color: "#FF6B35", fontFamily: "Inter_600SemiBold", textAlign: "center" }}>Selling Price</Text>
              </View>
              <Text style={[styles.formulaOp, { color: colors.textSecondary }]}>-</Text>
              <View style={[styles.formulaBox, { backgroundColor: "#6B7AFF20" }]}>
                <Text style={{ fontSize: 12, color: "#6B7AFF", fontFamily: "Inter_600SemiBold", textAlign: "center" }}>Purchase Price</Text>
              </View>
              <Text style={[styles.formulaOp, { color: colors.textSecondary }]}>=</Text>
              <View style={[styles.formulaBox, { backgroundColor: "#10B98120" }]}>
                <Text style={{ fontSize: 12, color: "#10B981", fontFamily: "Inter_600SemiBold", textAlign: "center" }}>Profit</Text>
              </View>
            </View>
          </View>

          <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.listTitle, { color: colors.text }]}>Recent Profits</Text>
            {sales.slice(0, 10).map((sale) => (
              <View key={sale.id} style={[styles.saleRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.saleIconBg, { backgroundColor: "#10B98120" }]}>
                  <Ionicons name="trending-up-outline" size={16} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.saleName, { color: colors.text }]}>{sale.items.length} item(s) sold</Text>
                  <Text style={[styles.saleDate, { color: colors.textSecondary }]}>
                    {sale.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </Text>
                </View>
                <Text style={[styles.profitAmount, { color: "#10B981" }]}>+₹{sale.totalProfit.toFixed(2)}</Text>
              </View>
            ))}
            {sales.length === 0 && (
              <Text style={[styles.noDataText, { color: colors.textSecondary, textAlign: "center", paddingVertical: 24 }]}>No data yet</Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  content: { padding: 16, gap: 16 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  chartCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 16 },
  periodTabs: { flexDirection: "row", backgroundColor: "#F3F4F6", borderRadius: 10, padding: 3, gap: 2 },
  periodTab: { flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: "center" },
  periodTabActive: { backgroundColor: "#10B981" },
  periodTabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  chartTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  noData: { alignItems: "center", paddingVertical: 32, gap: 8 },
  noDataText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  infoCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  infoTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  formulaRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  formulaBox: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center", minWidth: 70 },
  formulaOp: { fontSize: 18, fontFamily: "Inter_700Bold" },
  listCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 4 },
  listTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 8 },
  saleRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  saleIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  saleName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  saleDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  profitAmount: { fontSize: 15, fontFamily: "Inter_700Bold" },
});
