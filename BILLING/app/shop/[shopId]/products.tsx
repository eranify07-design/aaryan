import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/context/ThemeContext";
import { useProducts, Product } from "@/hooks/useProducts";

function StockBadge({ stock, colors }: { stock: number; colors: any }) {
  if (stock === 0) {
    return (
      <View style={[styles.badge, { backgroundColor: "#EF444420" }]}>
        <Text style={[styles.badgeText, { color: "#EF4444" }]}>OUT OF STOCK</Text>
      </View>
    );
  }
  if (stock < 5) {
    return (
      <View style={[styles.badge, { backgroundColor: "#F59E0B20" }]}>
        <Text style={[styles.badgeText, { color: "#F59E0B" }]}>LOW STOCK</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, { backgroundColor: "#10B98120" }]}>
      <Text style={[styles.badgeText, { color: "#10B981" }]}>In Stock</Text>
    </View>
  );
}

function ProductCard({
  product,
  onEdit,
  onDelete,
  colors,
  deleting,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  colors: any;
  deleting: boolean;
}) {
  return (
    <View
      style={[
        styles.productCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: deleting ? 0.6 : 1,
        },
      ]}
    >
      {product.photoUrl ? (
        <Image source={{ uri: product.photoUrl }} style={styles.productPhoto} />
      ) : (
        <View
          style={[
            styles.productPhotoPlaceholder,
            { backgroundColor: colors.inputBackground },
          ]}
        >
          <Ionicons name="cube-outline" size={28} color={colors.textTertiary} />
        </View>
      )}
      <View style={styles.productInfo}>
        <Text
          style={[styles.productName, { color: colors.text }]}
          numberOfLines={1}
        >
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
            Buy:{" "}
          </Text>
          <Text style={[styles.priceValue, { color: colors.textSecondary }]}>
            ₹{product.purchasePrice.toFixed(2)}
          </Text>
          <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
            {"  "}Sell:{" "}
          </Text>
          <Text style={[styles.priceValue, { color: colors.primary }]}>
            ₹{product.sellingPrice.toFixed(2)}
          </Text>
        </View>
        <View style={styles.stockRow}>
          <Text style={[styles.stockText, { color: colors.textSecondary }]}>
            Stock: {product.stock}
          </Text>
          <StockBadge stock={product.stock} colors={colors} />
        </View>
      </View>
      <View style={styles.actionBtns}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={onEdit}
          disabled={deleting}
        >
          <Ionicons name="pencil-outline" size={18} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={onDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ConfirmDeleteModal({
  visible,
  productName,
  onCancel,
  onConfirm,
  deleting,
  colors,
}: {
  visible: boolean;
  productName: string;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
  colors: any;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.modalIconWrap,
              { backgroundColor: "#EF444420" },
            ]}
          >
            <Ionicons name="trash-outline" size={28} color="#EF4444" />
          </View>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Delete Product
          </Text>
          <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
            Delete "{productName}"? This cannot be undone.
          </Text>
          <View style={styles.modalBtns}>
            <TouchableOpacity
              style={[
                styles.modalCancelBtn,
                { borderColor: colors.border },
              ]}
              onPress={onCancel}
              disabled={deleting}
            >
              <Text
                style={[styles.modalCancelText, { color: colors.textSecondary }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalDeleteBtn}
              onPress={onConfirm}
              disabled={deleting}
            >
              <LinearGradient
                colors={["#EF4444", "#DC2626"]}
                style={styles.modalDeleteGradient}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                    <Text style={styles.modalDeleteText}>Delete</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function ProductsScreen() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { colors } = useTheme();
  const { products, loading, deleteProduct } = useProducts(shopId);
  const insets = useSafeAreaInsets();

  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleEdit = (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/shop/${shopId}/edit-product/${product.id}` as any);
  };

  const handleDelete = (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPendingDelete(product);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDeleting(true);
    try {
      await deleteProduct(pendingDelete.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPendingDelete(null);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPendingDelete(null);
      Alert.alert("Delete Failed", e.message || "Could not delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#1A1A2E", "#16213E"]}
        style={[
          styles.header,
          {
            paddingTop:
              insets.top + (Platform.OS === "web" ? 67 : 12),
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>My Products</Text>
            <Text style={styles.headerSub}>{products.length} products</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() =>
              router.push(`/shop/${shopId}/add-product` as any)
            }
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator
          color="#FF6B35"
          style={{ marginTop: 48 }}
          size="large"
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            {
              paddingBottom:
                insets.bottom + (Platform.OS === "web" ? 34 : 24),
            },
          ]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="cube-outline"
                size={64}
                color={colors.textTertiary}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Products
              </Text>
              <Text
                style={[styles.emptySub, { color: colors.textSecondary }]}
              >
                Add products to this shop
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              colors={colors}
              deleting={deleting && pendingDelete?.id === item.id}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}

      <ConfirmDeleteModal
        visible={!!pendingDelete}
        productName={pendingDelete?.name ?? ""}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        deleting={deleting}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,107,53,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  productPhoto: {
    width: 60,
    height: 60,
    borderRadius: 10,
    resizeMode: "cover",
  },
  productPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  priceValue: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stockText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  actionBtns: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  editBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  modalSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  modalBtns: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  modalDeleteBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  modalDeleteGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
  },
  modalDeleteText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
