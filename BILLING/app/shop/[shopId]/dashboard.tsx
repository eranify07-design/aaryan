import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useShop } from "@/context/ShopContext";
import { useTheme } from "@/context/ThemeContext";

const MENU_ITEMS = [
  { label: "Add Product", icon: "add-circle-outline", route: "add-product", gradient: ["#667EEA", "#764BA2"] },
  { label: "Generate Bill", icon: "receipt-outline", route: "generate-bill", gradient: ["#FF6B35", "#E55A24"] },
  { label: "My Products", icon: "cube-outline", route: "products", gradient: ["#2EC4B6", "#1A9E94"] },
  { label: "Sales Analyzer", icon: "trending-up-outline", route: "sales-analyzer", gradient: ["#F59E0B", "#D97706"] },
  { label: "Profit Analyzer", icon: "analytics-outline", route: "profit-analyzer", gradient: ["#10B981", "#059669"] },
  { label: "Most Selling", icon: "trophy-outline", route: "most-selling", gradient: ["#EF4444", "#DC2626"] },
  { label: "Sales History", icon: "time-outline", route: "sales-history", gradient: ["#8B5CF6", "#7C3AED"] },
];

export default function ShopDashboard() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { colors } = useTheme();
  const { shops, setCurrentShop } = useShop();
  const insets = useSafeAreaInsets();

  const shop = shops.find((s) => s.id === shopId);

  useEffect(() => {
    if (shop) setCurrentShop(shop);
    return () => setCurrentShop(null);
  }, [shop]);

  if (!shop) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Shop not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={["#1A1A2E", "#16213E"]} style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerShopName}>{shop.name}</Text>
            <Text style={styles.headerSub}>Shop Dashboard</Text>
          </View>
          <View style={styles.shopIconSmall}>
            <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.shopIconGradient}>
              <Ionicons name="storefront" size={18} color="#fff" />
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Manage your shop</Text>
        <View style={styles.gridRow}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/shop/${shopId}/${item.route}` as any)}
              activeOpacity={0.75}
            >
              <LinearGradient colors={item.gradient as [string, string]} style={styles.menuIconBg}>
                <Ionicons name={item.icon as any} size={28} color="#fff" />
              </LinearGradient>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerCenter: {
    flex: 1,
  },
  headerShopName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
  },
  shopIconSmall: {
    borderRadius: 12,
    overflow: "hidden",
  },
  shopIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  menuCard: {
    width: "47%",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  menuIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
});
