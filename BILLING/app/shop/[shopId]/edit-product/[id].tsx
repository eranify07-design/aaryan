import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/context/ThemeContext";
import { useProducts, Product } from "@/hooks/useProducts";

export default function EditProductScreen() {
  const { shopId, id } = useLocalSearchParams<{ shopId: string; id: string }>();
  const { colors } = useTheme();
  const { products, updateProduct } = useProducts(shopId);
  const insets = useSafeAreaInsets();

  const product = products.find((p) => p.id === id);

  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPurchasePrice(product.purchasePrice.toString());
      setSellingPrice(product.sellingPrice.toString());
      setStock(product.stock.toString());
    }
  }, [product]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Product name cannot be empty");
      return;
    }
    if (!purchasePrice.trim() || !sellingPrice.trim() || !stock.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const parsedPurchase = parseFloat(purchasePrice);
    const parsedSelling = parseFloat(sellingPrice);
    const parsedStock = parseInt(stock, 10);

    if (isNaN(parsedPurchase) || isNaN(parsedSelling) || isNaN(parsedStock)) {
      Alert.alert("Error", "Invalid price or stock value");
      return;
    }

    if (parsedStock < 0) {
      Alert.alert("Error", "Stock cannot be negative");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      await updateProduct(id!, {
        name: name.trim(),
        purchasePrice: parsedPurchase,
        sellingPrice: parsedSelling,
        stock: parsedStock,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Update Failed", e.message || "Could not update product");
    } finally {
      setSaving(false);
    }
  };

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  const profit = parseFloat(sellingPrice) - parseFloat(purchasePrice) || 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#1A1A2E", "#16213E"]}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Edit Product</Text>
            <Text style={styles.headerSub}>{product.name}</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          {/* Product Name */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Product Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
              placeholder="Enter product name"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Purchase Price */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Purchase Price (₹)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Selling Price */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Selling Price (₹)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              value={sellingPrice}
              onChangeText={setSellingPrice}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Profit Display */}
          {!isNaN(profit) && (
            <View style={[styles.profitBox, { backgroundColor: profit >= 0 ? "#10B98120" : "#EF444420" }]}>
              <Text style={[styles.profitLabel, { color: colors.textSecondary }]}>Profit per unit:</Text>
              <Text style={[styles.profitValue, { color: profit >= 0 ? "#10B981" : "#EF4444" }]}>
                ₹{profit.toFixed(2)}
              </Text>
            </View>
          )}

          {/* Stock Quantity */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Stock Quantity</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              value={stock}
              onChangeText={setStock}
              keyboardType="number-pad"
            />
            <Text style={[styles.helperText, { color: colors.textTertiary }]}>
              Current stock: {product.stock} • Refill available if out of stock
            </Text>
          </View>

          {/* Historical Data Info */}
          <View style={[styles.infoBox, { backgroundColor: "#1E40AF20", borderColor: "#3B82F6" }]}>
            <Ionicons name="information-circle-outline" size={18} color="#3B82F6" />
            <Text style={[styles.infoText, { color: "#3B82F6" }]}>
              Past bills won't be affected by price changes
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, { opacity: saving ? 0.6 : 1 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.saveBtnGradient}>
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 0,
  },
  helperText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
  },
  profitBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profitLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  profitValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  infoBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  saveBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
