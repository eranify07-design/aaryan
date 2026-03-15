import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { useShop, Shop } from "@/context/ShopContext";
import { useTheme } from "@/context/ThemeContext";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function ShopCard({ shop, onPress, colors }: { shop: Shop; onPress: (action: string) => void; colors: any }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.shopCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => { router.push(`/shop/${shop.id}/dashboard`); }}
      activeOpacity={0.8}
    >
      <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.shopIconBg}>
        <Ionicons name="storefront" size={28} color="#fff" />
      </LinearGradient>

      <View style={styles.shopInfo}>
        <Text style={[styles.shopName, { color: colors.text }]} numberOfLines={1}>{shop.name}</Text>
        <Text style={[styles.shopSub, { color: colors.textSecondary }]}>Tap to open dashboard</Text>
      </View>

      <TouchableOpacity
        style={styles.menuBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setMenuOpen(true);
        }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menuPopup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setMenuOpen(false); onPress("rename"); }}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Rename Shop</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setMenuOpen(false); onPress("delete"); }}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={[styles.menuItemText, { color: "#EF4444" }]}>Delete Shop</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user, userProfile, signOut } = useAuth();
  const { shops, loading, addShop, renameShop, deleteShop } = useShop();
  const insets = useSafeAreaInsets();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [addShopModal, setAddShopModal] = useState(false);
  const [renameModal, setRenameModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shopName, setShopName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const greeting = getGreeting();
  const name = userProfile?.name?.split(" ")[0] ?? user?.displayName?.split(" ")[0] ?? "User";

  const handleShopAction = (shop: Shop, action: string) => {
    setSelectedShop(shop);
    if (action === "rename") {
      setShopName(shop.name);
      setRenameModal(true);
    } else if (action === "delete") {
      Alert.alert(
        "Delete Shop",
        `Are you sure you want to delete "${shop.name}"? All products and sales data will be deleted.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              try {
                await deleteShop(shop.id);
              } catch (e: any) {
                Alert.alert("Error", e.message);
              }
            },
          },
        ]
      );
    }
  };

  const handleAddShop = async () => {
    if (!shopName.trim()) return;
    setActionLoading(true);
    try {
      await addShop(shopName.trim());
      setAddShopModal(false);
      setShopName("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameShop = async () => {
    if (!selectedShop || !shopName.trim()) return;
    setActionLoading(true);
    try {
      await renameShop(selectedShop.id, shopName.trim());
      setRenameModal(false);
      setShopName("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const menuItems = [
    { label: "Settings", icon: "settings-outline", route: "/settings" },
    { label: "Contact Us", icon: "call-outline", route: "/contact-us" },
    { label: "Credits", icon: "star-outline", route: "/credits" },
    { label: "About Developer", icon: "code-slash-outline", route: "/about-developer" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={["#1A1A2E", "#16213E"]} style={[styles.topBar, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
        <View style={styles.topBarContent}>
          <View>
            <Text style={styles.greetingText}>{greeting},</Text>
            <Text style={styles.nameText}>{name}</Text>
          </View>
          <TouchableOpacity style={styles.menuIconBtn} onPress={() => setSideMenuOpen(true)}>
            <Ionicons name="menu" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={shops}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Shops</Text>
            <Text style={[styles.shopCount, { color: colors.textSecondary }]}>{shops.length}/2 shops</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color="#FF6B35" style={{ marginTop: 48 }} size="large" />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Shops Yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Add your first shop to get started
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <ShopCard
            shop={item}
            colors={colors}
            onPress={(action) => handleShopAction(item, action)}
          />
        )}
      />

      {shops.length < 2 && (
        <View style={[styles.addBtnContainer, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16) }]}>
          <TouchableOpacity
            style={styles.addShopBtn}
            onPress={() => { setShopName(""); setAddShopModal(true); }}
            activeOpacity={0.85}
          >
            <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.addShopBtnGradient}>
              <Ionicons name="add" size={22} color="#fff" />
              <Text style={styles.addShopBtnText}>Add Shop</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={sideMenuOpen} transparent animationType="fade" onRequestClose={() => setSideMenuOpen(false)}>
        <View style={styles.sideOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setSideMenuOpen(false)} />
          <View style={[styles.sideMenu, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.sideMenuHeader}>
              <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.sideLogoSmall}>
                <Ionicons name="receipt" size={20} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={[styles.sideMenuName, { color: colors.text }]}>{userProfile?.name ?? "User"}</Text>
                <Text style={[styles.sideMenuEmail, { color: colors.textSecondary }]} numberOfLines={1}>{userProfile?.email ?? ""}</Text>
              </View>
            </View>

            <View style={[styles.sideMenuDivider, { backgroundColor: colors.border }]} />

            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.sideMenuItem}
                onPress={() => { setSideMenuOpen(false); router.push(item.route as any); }}
              >
                <Ionicons name={item.icon as any} size={20} color={colors.text} />
                <Text style={[styles.sideMenuItemText, { color: colors.text }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={[styles.sideMenuDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.sideMenuItem}
              onPress={async () => {
                setSideMenuOpen(false);
                await signOut();
                router.replace("/auth/login");
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={[styles.sideMenuItemText, { color: "#EF4444" }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={addShopModal} transparent animationType="slide" onRequestClose={() => setAddShopModal(false)}>
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Shop</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter shop name"
              placeholderTextColor={colors.textTertiary}
              value={shopName}
              onChangeText={setShopName}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: colors.border }]} onPress={() => setAddShopModal(false)}>
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleAddShop} disabled={actionLoading}>
                <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.modalConfirmGradient}>
                  {actionLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalConfirmText}>Add</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={renameModal} transparent animationType="slide" onRequestClose={() => setRenameModal(false)}>
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Rename Shop</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter new name"
              placeholderTextColor={colors.textTertiary}
              value={shopName}
              onChangeText={setShopName}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: colors.border }]} onPress={() => setRenameModal(false)}>
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleRenameShop} disabled={actionLoading}>
                <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.modalConfirmGradient}>
                  {actionLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalConfirmText}>Save</Text>}
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
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  topBarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  greetingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
  },
  nameText: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  menuIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: 20,
    gap: 14,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  shopCount: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  shopCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  shopIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  shopInfo: {
    flex: 1,
    gap: 3,
  },
  shopName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  shopSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "flex-end",
    paddingTop: 100,
    paddingRight: 60,
  },
  menuPopup: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  menuDivider: {
    height: 1,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  addBtnContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  addShopBtn: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addShopBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  addShopBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  sideOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sideMenu: {
    width: 280,
    paddingTop: 56,
    paddingHorizontal: 0,
  },
  sideMenuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sideLogoSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sideMenuName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  sideMenuEmail: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    maxWidth: 180,
  },
  sideMenuDivider: {
    height: 1,
    marginVertical: 8,
  },
  sideMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  sideMenuItemText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  modalInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  modalBtns: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  modalConfirmBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalConfirmGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  modalConfirmText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
