import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/context/ThemeContext";
import { useProducts, Product } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";

interface CartItem {
  product: Product;
  quantity: number;
  customPrice: number;
}

function ProductBillCard({ product, cartItem, onAdd, onRemove, colors }: {
  product: Product;
  cartItem: CartItem | undefined;
  onAdd: () => void;
  onRemove: () => void;
  colors: any;
}) {
  const qty = cartItem?.quantity ?? 0;
  const isOutOfStock = product.stock === 0;
  const isLow = product.stock > 0 && product.stock < 5;

  return (
    <View style={[styles.billCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {product.photoUrl ? (
        <Image source={{ uri: product.photoUrl }} style={styles.billPhoto} />
      ) : (
        <View style={[styles.billPhotoPlaceholder, { backgroundColor: colors.inputBackground }]}>
          <Ionicons name="cube-outline" size={22} color={colors.textTertiary} />
        </View>
      )}
      <View style={styles.billInfo}>
        <Text style={[styles.billName, { color: colors.text }]} numberOfLines={1}>{product.name}</Text>
        <Text style={[styles.billPrice, { color: colors.primary }]}>₹{product.sellingPrice.toFixed(2)}</Text>
        <View style={styles.stockRow}>
          <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>Stock: {product.stock}</Text>
          {isOutOfStock && (
            <View style={[styles.miniTag, { backgroundColor: "#EF444420" }]}>
              <Text style={{ fontSize: 9, color: "#EF4444", fontFamily: "Inter_700Bold" }}>OUT</Text>
            </View>
          )}
          {isLow && (
            <View style={[styles.miniTag, { backgroundColor: "#F59E0B20" }]}>
              <Text style={{ fontSize: 9, color: "#F59E0B", fontFamily: "Inter_700Bold" }}>LOW</Text>
            </View>
          )}
        </View>
      </View>
      {isOutOfStock ? (
        <View style={styles.outOfStockText}>
          <Text style={{ fontSize: 11, color: "#EF4444", fontFamily: "Inter_600SemiBold" }}>Out of Stock</Text>
        </View>
      ) : (
        <View style={styles.qtyControls}>
          <TouchableOpacity onPress={onRemove} style={[styles.qtyBtn, { backgroundColor: qty > 0 ? colors.primary + "20" : colors.inputBackground }]} disabled={qty === 0}>
            <Ionicons name="remove" size={18} color={qty > 0 ? colors.primary : colors.textTertiary} />
          </TouchableOpacity>
          <Text style={[styles.qtyNum, { color: colors.text }]}>{qty}</Text>
          <TouchableOpacity onPress={onAdd} style={[styles.qtyBtn, { backgroundColor: colors.primary + "20" }]} disabled={qty >= product.stock}>
            <Ionicons name="add" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function GenerateBillScreen() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { colors } = useTheme();
  const { products, loading, decreaseStock } = useProducts(shopId);
  const { addSale } = useSales(shopId);
  const insets = useSafeAreaInsets();

  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState("");

  const addToCart = (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(product.id);
      if (existing && existing.quantity < product.stock) {
        newMap.set(product.id, { ...existing, quantity: existing.quantity + 1 });
      } else if (!existing) {
        newMap.set(product.id, { product, quantity: 1, customPrice: product.sellingPrice });
      }
      return newMap;
    });
  };

  const removeFromCart = (productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(productId);
      if (existing) {
        if (existing.quantity <= 1) newMap.delete(productId);
        else newMap.set(productId, { ...existing, quantity: existing.quantity - 1 });
      }
      return newMap;
    });
  };

  const updateCustomPrice = (productId: string, newPrice: number) => {
    setCart((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(productId);
      if (existing) {
        newMap.set(productId, { ...existing, customPrice: newPrice });
      }
      return newMap;
    });
  };

  const cartItems = Array.from(cart.values());
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = cartItems.reduce((sum, i) => sum + i.customPrice * i.quantity, 0);
  const totalProfit = cartItems.reduce((sum, i) => sum + (i.customPrice - i.product.purchasePrice) * i.quantity, 0);

  const handleGenerateBill = async () => {
    if (cartItems.length === 0) return Alert.alert("Empty Cart", "Add products to generate a bill");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      await addSale({
        shopId: shopId!,
        items: cartItems.map((ci) => ({
          productId: ci.product.id,
          productName: ci.product.name,
          quantity: ci.quantity,
          sellingPrice: ci.customPrice,
          purchasePrice: ci.product.purchasePrice,
        })),
        totalAmount,
        totalProfit,
      });
      for (const ci of cartItems) {
        await decreaseStock(ci.product.id, ci.quantity);
      }
      setCart(new Map());
      setSummaryOpen(false);
      setShowMore(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Bill Generated", `Total: ₹${totalAmount.toFixed(2)}\nProfit: ₹${totalProfit.toFixed(2)}`, [
        { text: "OK" },
      ]);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStartEditPrice = (ci: CartItem) => {
    setEditingProductId(ci.product.id);
    setEditPriceValue(ci.customPrice.toString());
  };

  const handleConfirmEditPrice = () => {
    if (editingProductId) {
      const val = parseFloat(editPriceValue);
      if (!isNaN(val) && val >= 0) {
        updateCustomPrice(editingProductId, val);
      }
      setEditingProductId(null);
      setEditPriceValue("");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={["#1A1A2E", "#16213E"]} style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Generate Bill</Text>
            <Text style={styles.headerSub}>{totalItems} items · ₹{totalAmount.toFixed(2)}</Text>
          </View>
          {totalItems > 0 && (
            <TouchableOpacity style={styles.summaryBtn} onPress={() => setSummaryOpen(true)}>
              <Ionicons name="receipt-outline" size={22} color="#FF6B35" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color="#FF6B35" style={{ marginTop: 48 }} size="large" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (totalItems > 0 ? 220 : 100) }]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Products</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>Add products first</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProductBillCard
              product={item}
              cartItem={cart.get(item.id)}
              onAdd={() => addToCart(item)}
              onRemove={() => removeFromCart(item.id)}
              colors={colors}
            />
          )}
        />
      )}

      {totalItems > 0 && (
        <View style={[styles.footerContainer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16) }]}>
          {showMore && (
            <ScrollView style={styles.showMoreScroll} nestedScrollEnabled>
              {cartItems.map((ci) => (
                <View key={ci.product.id} style={[styles.showMoreItem, { borderBottomColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.showMoreName, { color: colors.text }]} numberOfLines={1}>{ci.product.name}</Text>
                    <Text style={[styles.showMoreMeta, { color: colors.textSecondary }]}>
                      Qty: {ci.quantity} · ₹{ci.customPrice.toFixed(2)} each
                    </Text>
                    {ci.customPrice !== ci.product.sellingPrice && (
                      <Text style={[styles.showMoreOriginal, { color: colors.textTertiary }]}>
                        Original: ₹{ci.product.sellingPrice.toFixed(2)}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.showMoreTotal, { color: colors.primary }]}>
                    ₹{(ci.customPrice * ci.quantity).toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    style={[styles.editPriceBtn, { borderColor: colors.border }]}
                    onPress={() => handleStartEditPrice(ci)}
                  >
                    <Ionicons name="create-outline" size={14} color={colors.primary} />
                    <Text style={[styles.editPriceBtnText, { color: colors.primary }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.footerSummaryStrip}>
            <View style={styles.footerTotalsRow}>
              <View>
                <Text style={[styles.footerTotal, { color: colors.text }]}>₹{totalAmount.toFixed(2)}</Text>
                <Text style={[styles.footerItems, { color: colors.textSecondary }]}>{totalItems} items</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowMore((v) => !v)}
                style={[styles.showMoreBtn, { borderColor: colors.border }]}
              >
                <Ionicons name={showMore ? "chevron-down" : "chevron-up"} size={16} color={colors.primary} />
                <Text style={[styles.showMoreBtnText, { color: colors.primary }]}>
                  {showMore ? "Show Less" : "Show More"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleGenerateBill} disabled={saving} style={styles.billBtn}>
            <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.billBtnGradient}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.billBtnText}>Generate Bill</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={summaryOpen} transparent animationType="slide" onRequestClose={() => setSummaryOpen(false)}>
        <View style={styles.modalBg}>
          <View style={[styles.summaryModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.summaryHeader}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>Bill Summary</Text>
              <TouchableOpacity onPress={() => setSummaryOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {cartItems.map((ci) => (
                <View key={ci.product.id} style={[styles.summaryItem, { borderBottomColor: colors.border }]}>
                  {ci.product.photoUrl ? (
                    <Image source={{ uri: ci.product.photoUrl }} style={styles.summaryPhoto} />
                  ) : (
                    <View style={[styles.summaryPhotoPlaceholder, { backgroundColor: colors.inputBackground }]}>
                      <Ionicons name="cube-outline" size={14} color={colors.textTertiary} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.summaryItemName, { color: colors.text }]} numberOfLines={1}>{ci.product.name}</Text>
                    <Text style={[styles.summaryItemQty, { color: colors.textSecondary }]}>Qty: {ci.quantity} × ₹{ci.customPrice.toFixed(2)}</Text>
                    {ci.customPrice !== ci.product.sellingPrice && (
                      <Text style={{ fontSize: 10, fontFamily: "Inter_400Regular", color: colors.textTertiary }}>
                        Original: ₹{ci.product.sellingPrice.toFixed(2)}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.summaryItemPrice, { color: colors.primary }]}>₹{(ci.customPrice * ci.quantity).toFixed(2)}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={[styles.summaryTotals, { borderTopColor: colors.border }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Items:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{totalItems}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Amount:</Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>₹{totalAmount.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleGenerateBill} disabled={saving} style={styles.genBtn}>
              <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.genBtnGradient}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.genBtnText}>Confirm & Generate</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!editingProductId} transparent animationType="fade" onRequestClose={() => setEditingProductId(null)}>
        <View style={styles.editPriceOverlay}>
          <View style={[styles.editPriceModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.editPriceTitle, { color: colors.text }]}>Edit Price</Text>
            <Text style={[styles.editPriceSub, { color: colors.textSecondary }]}>
              This change applies only to this bill
            </Text>
            <TextInput
              style={[styles.editPriceInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              value={editPriceValue}
              onChangeText={setEditPriceValue}
              keyboardType="numeric"
              placeholder="Enter new price"
              placeholderTextColor={colors.textTertiary}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.editPriceBtns}>
              <TouchableOpacity
                style={[styles.editPriceCancelBtn, { borderColor: colors.border }]}
                onPress={() => { setEditingProductId(null); setEditPriceValue(""); }}
              >
                <Text style={[styles.editPriceCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editPriceConfirmBtn} onPress={handleConfirmEditPrice}>
                <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.editPriceConfirmGradient}>
                  <Text style={styles.editPriceConfirmText}>Update</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  summaryBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,107,53,0.2)", alignItems: "center", justifyContent: "center" },
  list: { padding: 16, gap: 10 },
  billCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 12, gap: 12, borderWidth: 1 },
  billPhoto: { width: 52, height: 52, borderRadius: 10 },
  billPhotoPlaceholder: { width: 52, height: 52, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  billInfo: { flex: 1, gap: 3 },
  billName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  billPrice: { fontSize: 15, fontFamily: "Inter_700Bold" },
  stockRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  stockLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  miniTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  qtyNum: { fontSize: 16, fontFamily: "Inter_700Bold", minWidth: 24, textAlign: "center" },
  outOfStockText: { alignItems: "center" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerContainer: { position: "absolute", bottom: 0, left: 0, right: 0, borderTopWidth: 1, paddingHorizontal: 16 },
  showMoreScroll: { maxHeight: 200, marginBottom: 8 },
  showMoreItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, gap: 8 },
  showMoreName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  showMoreMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  showMoreOriginal: { fontSize: 10, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  showMoreTotal: { fontSize: 13, fontFamily: "Inter_700Bold" },
  editPriceBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  editPriceBtnText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  footerSummaryStrip: { paddingTop: 10, paddingBottom: 8 },
  footerTotalsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerTotal: { fontSize: 22, fontFamily: "Inter_700Bold" },
  footerItems: { fontSize: 13, fontFamily: "Inter_400Regular" },
  showMoreBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  showMoreBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  billBtn: { borderRadius: 12, overflow: "hidden", marginBottom: 4 },
  billBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 20, paddingVertical: 14 },
  billBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  summaryModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 24, gap: 16 },
  summaryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  summaryItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
  summaryPhoto: { width: 36, height: 36, borderRadius: 8 },
  summaryPhotoPlaceholder: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  summaryItemName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  summaryItemQty: { fontSize: 12, fontFamily: "Inter_400Regular" },
  summaryItemPrice: { fontSize: 14, fontFamily: "Inter_700Bold" },
  summaryTotals: { borderTopWidth: 1, paddingTop: 12, gap: 8 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 14, fontFamily: "Inter_700Bold" },
  genBtn: { borderRadius: 14, overflow: "hidden" },
  genBtnGradient: { alignItems: "center", paddingVertical: 16 },
  genBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  editPriceOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  editPriceModal: { width: "100%", maxWidth: 340, borderRadius: 20, borderWidth: 1, padding: 24, gap: 12 },
  editPriceTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  editPriceSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  editPriceInput: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontFamily: "Inter_600SemiBold", borderWidth: 1 },
  editPriceBtns: { flexDirection: "row", gap: 12, marginTop: 4 },
  editPriceCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  editPriceCancelText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  editPriceConfirmBtn: { flex: 1, borderRadius: 12, overflow: "hidden" },
  editPriceConfirmGradient: { paddingVertical: 12, alignItems: "center" },
  editPriceConfirmText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
