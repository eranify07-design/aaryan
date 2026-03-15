import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { useSales } from "@/hooks/useSales";
import { useProducts } from "@/hooks/useProducts";

interface RankedProduct {
  productId: string;
  productName: string;
  totalQty: number;
  totalRevenue: number;
  rank: number;
  product?: any;
}

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const RANK_LABELS = ["1st", "2nd", "3rd"];

export default function MostSellingScreen() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { colors } = useTheme();
  const { sales, loading: salesLoading } = useSales(shopId);
  const { products, loading: productsLoading } = useProducts(shopId);
  const insets = useSafeAreaInsets();

  const loading = salesLoading || productsLoading;

  const ranked: RankedProduct[] = (() => {
    const map: Record<string, RankedProduct> = {};
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!map[item.productId]) {
          map[item.productId] = {
            productId: item.productId,
            productName: item.productName,
            totalQty: 0,
            totalRevenue: 0,
            rank: 0,
          };
        }
        map[item.productId].totalQty += item.quantity;
        map[item.productId].totalRevenue += item.sellingPrice * item.quantity;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.totalQty - a.totalQty)
      .map((item, i) => ({
        ...item,
        rank: i + 1,
        product: products.find((p) => p.id === item.productId),
      }));
  })();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={["#1A1A2E", "#16213E"]} style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Most Selling Products</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color="#FF6B35" size="large" style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={ranked}
          keyExtractor={(item) => item.productId}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) }]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="trophy-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Sales Yet</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>Generate bills to see ranking</Text>
            </View>
          }
          ListHeaderComponent={
            ranked.length > 0 ? (
              <View style={styles.podiumContainer}>
                {ranked.slice(0, 3).map((item, i) => (
                  <View key={item.productId} style={[styles.podiumItem, i === 0 && styles.podiumFirst]}>
                    <View style={[styles.podiumMedal, { backgroundColor: RANK_COLORS[i] + "30" }]}>
                      <Ionicons name="trophy" size={i === 0 ? 28 : 22} color={RANK_COLORS[i]} />
                    </View>
                    <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={2}>{item.productName}</Text>
                    <Text style={[styles.podiumQty, { color: RANK_COLORS[i] }]}>{item.totalQty} sold</Text>
                    <View style={[styles.podiumRankBadge, { backgroundColor: RANK_COLORS[i] }]}>
                      <Text style={styles.podiumRankText}>{RANK_LABELS[i]}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={[styles.rankCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.rankBadge, { backgroundColor: item.rank <= 3 ? RANK_COLORS[item.rank - 1] + "20" : colors.inputBackground }]}>
                <Text style={[styles.rankNum, { color: item.rank <= 3 ? RANK_COLORS[item.rank - 1] : colors.textSecondary }]}>#{item.rank}</Text>
              </View>
              {item.product?.photoUrl ? (
                <Image source={{ uri: item.product.photoUrl }} style={styles.rankPhoto} />
              ) : (
                <View style={[styles.rankPhotoPlaceholder, { backgroundColor: colors.inputBackground }]}>
                  <Ionicons name="cube-outline" size={20} color={colors.textTertiary} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.rankName, { color: colors.text }]} numberOfLines={1}>{item.productName}</Text>
                <Text style={[styles.rankRevenue, { color: colors.textSecondary }]}>Revenue: ₹{item.totalRevenue.toFixed(0)}</Text>
              </View>
              <View style={styles.rankQtyBadge}>
                <Text style={styles.rankQtyText}>{item.totalQty}</Text>
                <Text style={styles.rankQtyLabel}>sold</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  list: { padding: 16, gap: 10 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  podiumContainer: { flexDirection: "row", gap: 10, marginBottom: 16, alignItems: "flex-end" },
  podiumItem: { flex: 1, borderRadius: 14, backgroundColor: "#F3F4F6", padding: 12, alignItems: "center", gap: 6 },
  podiumFirst: { backgroundColor: "#FFD70015", borderWidth: 1, borderColor: "#FFD70040" },
  podiumMedal: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  podiumName: { fontSize: 11, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  podiumQty: { fontSize: 13, fontFamily: "Inter_700Bold" },
  podiumRankBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  podiumRankText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  rankCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14, gap: 12, borderWidth: 1 },
  rankBadge: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rankNum: { fontSize: 13, fontFamily: "Inter_700Bold" },
  rankPhoto: { width: 44, height: 44, borderRadius: 10 },
  rankPhotoPlaceholder: { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rankName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  rankRevenue: { fontSize: 12, fontFamily: "Inter_400Regular" },
  rankQtyBadge: { alignItems: "center" },
  rankQtyText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FF6B35" },
  rankQtyLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: "#9CA3AF" },
});
