import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { useSales, Sale } from "@/hooks/useSales";

type MenuState = { saleId: string; x: number; y: number } | null;

type FilterKey = "today" | "yesterday" | "7days" | "30days" | "custom";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function formatDate(d: Date) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function shortBillId(id: string) {
  return "#" + id.slice(-4).toUpperCase();
}

function parseCustomDate(s: string): Date | null {
  const parts = s.split("/");
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parseInt(parts[2], 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  if (m < 0 || m > 11 || d < 1 || d > 31 || y < 1900 || y > 2100) return null;
  const date = new Date(y, m, d);
  if (date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== d) return null;
  return date;
}

export default function SalesHistoryScreen() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { colors } = useTheme();
  const { sales, loading, deleteSale } = useSales(shopId);
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState<FilterKey>("today");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuState>(null);
  const [deleting, setDeleting] = useState(false);

  const now = new Date();
  const today = startOfDay(now);

  const filteredSales = useMemo(() => {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenAgo = new Date(today);
    sevenAgo.setDate(sevenAgo.getDate() - 7);
    const thirtyAgo = new Date(today);
    thirtyAgo.setDate(thirtyAgo.getDate() - 30);

    return sales.filter((s) => {
      const d = s.createdAt;
      switch (activeFilter) {
        case "today":
          return isSameDay(d, today);
        case "yesterday":
          return isSameDay(d, yesterday);
        case "7days":
          return d >= sevenAgo;
        case "30days":
          return d >= thirtyAgo;
        case "custom": {
          const from = parseCustomDate(customFrom);
          const to = parseCustomDate(customTo);
          if (!from || !to) return false;
          const sod = startOfDay(from);
          const eod = new Date(to);
          eod.setHours(23, 59, 59, 999);
          return d >= sod && d <= eod;
        }
        default:
          return true;
      }
    });
  }, [sales, activeFilter, customFrom, customTo]);

  const todaySales = useMemo(() => {
    return sales.filter((s) => isSameDay(s.createdAt, today));
  }, [sales]);

  const todayTotal = todaySales.reduce((s, sale) => s + sale.totalAmount, 0);
  const todayBills = todaySales.length;
  const todayItems = todaySales.reduce(
    (s, sale) => s + sale.items.reduce((a, i) => a + i.quantity, 0),
    0
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Sale[]>();
    for (const sale of filteredSales) {
      const key = formatDate(sale.createdAt);
      const arr = map.get(key) ?? [];
      arr.push(sale);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [filteredSales]);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "7days", label: "7 Days" },
    { key: "30days", label: "30 Days" },
    { key: "custom", label: "Custom" },
  ];

  const handleDeleteSale = (sale: Sale) => {
    setOpenMenu(null);
    Alert.alert(
      "Delete Sale",
      `Are you sure you want to delete Bill ${shortBillId(sale.id)}? This will restore the stock and remove it from profit.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteSale(sale);
            } catch (e) {
              Alert.alert("Error", "Could not delete sale. Please try again.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} onStartShouldSetResponder={() => { if (openMenu) { setOpenMenu(null); } return false; }}>
      <LinearGradient
        colors={["#1A1A2E", "#16213E"]}
        style={[
          styles.header,
          { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sales History</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color="#FF6B35" style={{ marginTop: 48 }} size="large" />
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) => item[0]}
          onScrollBeginDrag={() => setOpenMenu(null)}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) },
          ]}
          ListHeaderComponent={
            <>
              <View style={styles.summaryRow}>
                <View
                  style={[
                    styles.summaryCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="cash-outline" size={20} color={colors.primary} />
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    ₹{todayTotal.toFixed(0)}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Today's Sales
                  </Text>
                </View>
                <View
                  style={[
                    styles.summaryCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="receipt-outline" size={20} color={colors.accent} />
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {todayBills}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Bills Today
                  </Text>
                </View>
                <View
                  style={[
                    styles.summaryCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="cube-outline" size={20} color="#F59E0B" />
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {todayItems}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Items Sold
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {filters.map((f) => {
                  const active = activeFilter === f.key;
                  return (
                    <TouchableOpacity
                      key={f.key}
                      onPress={() => {
                        if (f.key === "custom") {
                          setShowCustomModal(true);
                          return;
                        }
                        setActiveFilter(f.key);
                      }}
                      style={[
                        styles.filterPill,
                        {
                          backgroundColor: active ? colors.primary : colors.card,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          { color: active ? "#fff" : colors.text },
                        ]}
                      >
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Sales Found</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                No bills match the selected filter
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const [dateLabel, dateSales] = item;
            return (
              <View style={styles.dateGroup}>
                <Text style={[styles.dateHeader, { color: colors.textSecondary }]}>
                  {dateLabel}
                </Text>
                {dateSales.map((sale) => {
                  const itemCount = sale.items.reduce((a, i) => a + i.quantity, 0);
                  const menuOpen = openMenu?.saleId === sale.id;
                  return (
                    <View key={sale.id}>
                      <TouchableOpacity
                        style={[
                          styles.billCard,
                          { backgroundColor: colors.card, borderColor: colors.border },
                        ]}
                        onPress={() => {
                          if (openMenu) { setOpenMenu(null); return; }
                          setSelectedSale(sale);
                        }}
                        activeOpacity={0.75}
                      >
                        <View
                          style={[
                            styles.billIcon,
                            { backgroundColor: colors.primary + "18" },
                          ]}
                        >
                          <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.billInfo}>
                          <Text style={[styles.billId, { color: colors.text }]}>
                            Bill {shortBillId(sale.id)}
                          </Text>
                          <Text style={[styles.billTime, { color: colors.textSecondary }]}>
                            {formatTime(sale.createdAt)} · {itemCount} items
                          </Text>
                        </View>
                        <Text style={[styles.billAmount, { color: colors.primary }]}>
                          ₹{sale.totalAmount.toFixed(2)}
                        </Text>
                        <TouchableOpacity
                          style={styles.menuDotBtn}
                          onPress={() =>
                            setOpenMenu(menuOpen ? null : { saleId: sale.id, x: 0, y: 0 })
                          }
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons
                            name="ellipsis-vertical"
                            size={18}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </TouchableOpacity>

                      {menuOpen && (
                        <View
                          style={[
                            styles.dropdownMenu,
                            {
                              backgroundColor: colors.card,
                              borderColor: colors.border,
                              shadowColor: "#000",
                            },
                          ]}
                        >
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => handleDeleteSale(sale)}
                            disabled={deleting}
                          >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                            <Text style={styles.dropdownDeleteText}>
                              Delete Sale History
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          }}
        />
      )}

      <Modal
        visible={!!selectedSale}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedSale(null)}
      >
        <View style={styles.modalBg}>
          <View
            style={[
              styles.detailModal,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {selectedSale && (
              <>
                <View style={styles.detailHeader}>
                  <View>
                    <Text style={[styles.detailTitle, { color: colors.text }]}>
                      Bill {shortBillId(selectedSale.id)}
                    </Text>
                    <Text style={[styles.detailDate, { color: colors.textSecondary }]}>
                      {formatDate(selectedSale.createdAt)} ·{" "}
                      {formatTime(selectedSale.createdAt)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedSale(null)}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 300 }}>
                  {selectedSale.items.map((item, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.detailItem,
                        { borderBottomColor: colors.border },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.detailItemName, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {item.productName}
                        </Text>
                        <Text
                          style={[
                            styles.detailItemMeta,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Qty: {item.quantity} × ₹{item.sellingPrice.toFixed(2)}
                        </Text>
                      </View>
                      <Text style={[styles.detailItemTotal, { color: colors.primary }]}>
                        ₹{(item.quantity * item.sellingPrice).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={[styles.detailTotals, { borderTopColor: colors.border }]}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Total Items
                    </Text>
                    <Text style={[styles.detailVal, { color: colors.text }]}>
                      {selectedSale.items.reduce((a, i) => a + i.quantity, 0)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Total Amount
                    </Text>
                    <Text style={[styles.detailVal, { color: colors.primary }]}>
                      ₹{selectedSale.totalAmount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCustomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalBg}>
          <View
            style={[
              styles.detailModal,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.detailHeader}>
              <Text style={[styles.detailTitle, { color: colors.text }]}>
                Custom Date Range
              </Text>
              <TouchableOpacity onPress={() => setShowCustomModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.customFields}>
              <View style={styles.customField}>
                <Text style={[styles.customLabel, { color: colors.textSecondary }]}>
                  From (DD/MM/YYYY)
                </Text>
                <TextInput
                  style={[
                    styles.customInput,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="01/01/2026"
                  placeholderTextColor={colors.textTertiary}
                  value={customFrom}
                  onChangeText={setCustomFrom}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={styles.customField}>
                <Text style={[styles.customLabel, { color: colors.textSecondary }]}>
                  To (DD/MM/YYYY)
                </Text>
                <TextInput
                  style={[
                    styles.customInput,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="31/12/2026"
                  placeholderTextColor={colors.textTertiary}
                  value={customTo}
                  onChangeText={setCustomTo}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => {
                const from = parseCustomDate(customFrom);
                const to = parseCustomDate(customTo);
                if (!from || !to) {
                  Alert.alert("Invalid Date", "Please enter valid dates in DD/MM/YYYY format");
                  return;
                }
                if (from > to) {
                  Alert.alert("Invalid Range", "From date must be before To date");
                  return;
                }
                setActiveFilter("custom");
                setShowCustomModal(false);
              }}
            >
              <LinearGradient
                colors={["#FF6B35", "#E55A24"]}
                style={styles.applyBtnGradient}
              >
                <Text style={styles.applyBtnText}>Apply Filter</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  listContent: { padding: 16, gap: 8 },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
  },
  summaryValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  filterRow: { gap: 8, paddingBottom: 16 },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  dateGroup: { gap: 8, marginBottom: 16 },
  dateHeader: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  billCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
  },
  billIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  billInfo: { flex: 1, gap: 2 },
  billId: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  billTime: { fontSize: 12, fontFamily: "Inter_400Regular" },
  billAmount: { fontSize: 15, fontFamily: "Inter_700Bold" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  detailModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  detailDate: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  detailItemName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  detailItemMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  detailItemTotal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  detailTotals: { borderTopWidth: 1, paddingTop: 12, gap: 8 },
  detailRow: { flexDirection: "row", justifyContent: "space-between" },
  detailLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  detailVal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  customFields: { gap: 14 },
  customField: { gap: 6 },
  customLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  customInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  applyBtn: { borderRadius: 14, overflow: "hidden" },
  applyBtnGradient: { alignItems: "center", paddingVertical: 14 },
  applyBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  menuDotBtn: {
    padding: 4,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownMenu: {
    position: "absolute",
    right: 8,
    top: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 4,
    zIndex: 999,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 180,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownDeleteText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#EF4444",
  },
});
