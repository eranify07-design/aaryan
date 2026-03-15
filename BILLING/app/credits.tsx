import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

export default function CreditsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={["#1A1A2E", "#16213E"]} style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Credits</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) }]}>
        <View style={styles.heroSection}>
          <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.heroGradient}>
            <Ionicons name="star" size={48} color="#FFD700" />
          </LinearGradient>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Credits</Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>Meet the people who made this app possible</Text>
        </View>

        <View style={[styles.creditCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.creditAvatar}>
            <Text style={styles.creditInitial}>A</Text>
          </LinearGradient>
          <View style={styles.creditInfo}>
            <Text style={[styles.creditRole, { color: colors.primary }]}>App Developer</Text>
            <Text style={[styles.creditName, { color: colors.text }]}>Aaryan Prajapati</Text>
            <Text style={[styles.creditDesc, { color: colors.textSecondary }]}>
              Designed and developed the entire Dastak Mobile application
            </Text>
          </View>
        </View>

        <View style={[styles.copyrightCard, { backgroundColor: colors.inputBackground }]}>
          <Text style={[styles.copyright, { color: colors.textTertiary }]}>
            © 2026 Dastak Mobile · All rights reserved
          </Text>
          <Text style={[styles.copyright, { color: colors.textTertiary }]}>
            Made with love by Aaryan Prajapati
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  content: { padding: 20, gap: 16 },
  heroSection: { alignItems: "center", paddingVertical: 24, gap: 10 },
  heroGradient: { width: 88, height: 88, borderRadius: 28, alignItems: "center", justifyContent: "center", shadowColor: "#FF6B35", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  heroTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  heroSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  creditCard: { borderRadius: 20, padding: 20, borderWidth: 1, alignItems: "center", gap: 14 },
  creditAvatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", shadowColor: "#FF6B35", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  creditInitial: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  creditInfo: { alignItems: "center", gap: 4 },
  creditRole: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 1, textTransform: "uppercase" },
  creditName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  creditDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  techCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 0 },
  techTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  techRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 14 },
  techIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  techName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  techDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginHorizontal: 0 },
  copyrightCard: { borderRadius: 14, padding: 16, alignItems: "center", gap: 4 },
  copyright: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
});
