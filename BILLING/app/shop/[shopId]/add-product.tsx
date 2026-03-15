import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/context/ThemeContext";
import { useProducts } from "@/hooks/useProducts";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export default function AddProductScreen() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { colors } = useTheme();
  const { addProduct } = useProducts(shopId);
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Please allow photo access");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const uploadPhoto = async (uri: string): Promise<string> => {
    if (Platform.OS === "web") return uri;
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `products/${shopId}/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert("Error", "Product name is required");
    if (!purchasePrice || !sellingPrice) return Alert.alert("Error", "Prices are required");
    if (!stock) return Alert.alert("Error", "Stock quantity is required");

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      let photoUrl = "";
      if (photoUri) {
        photoUrl = await uploadPhoto(photoUri);
      }
      await addProduct({
        shopId: shopId!,
        name: name.trim(),
        purchasePrice: parseFloat(purchasePrice),
        sellingPrice: parseFloat(sellingPrice),
        stock: parseInt(stock),
        photoUrl,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Product added successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={["#1A1A2E", "#16213E"]} style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Product</Text>
        </View>
      </LinearGradient>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 40 }]}>
        <TouchableOpacity style={[styles.photoPicker, { backgroundColor: colors.inputBackground, borderColor: colors.border }]} onPress={pickImage}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={36} color={colors.textTertiary} />
              <Text style={[styles.photoText, { color: colors.textSecondary }]}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {[
          { label: "Product Name", value: name, onChange: setName, placeholder: "Enter product name", keyboard: "default" as const },
          { label: "Purchase Price (₹)", value: purchasePrice, onChange: setPurchasePrice, placeholder: "0.00", keyboard: "numeric" as const },
          { label: "Selling Price (₹)", value: sellingPrice, onChange: setSellingPrice, placeholder: "0.00", keyboard: "numeric" as const },
          { label: "Stock Quantity", value: stock, onChange: setStock, placeholder: "0", keyboard: "numeric" as const },
        ].map((field) => (
          <View key={field.label} style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{field.label}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              placeholder={field.placeholder}
              placeholderTextColor={colors.textTertiary}
              value={field.value}
              onChangeText={field.onChange}
              keyboardType={field.keyboard}
              autoCapitalize="none"
            />
          </View>
        ))}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
          <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.saveBtnGradient}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Save Product</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
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
  form: {
    padding: 20,
    gap: 18,
  },
  photoPicker: {
    height: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  photoPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoPlaceholder: {
    alignItems: "center",
    gap: 8,
  },
  photoText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  saveBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
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
    paddingVertical: 16,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
