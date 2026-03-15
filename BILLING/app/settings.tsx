import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsScreen() {
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const insets = useSafeAreaInsets();

  const handleToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setThemeMode(value ? "dark" : "light");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={["#1A1A2E", "#16213E"]} style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: "#667EEA20" }]}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={20} color="#667EEA" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  {isDark ? "Currently in dark mode" : "Currently in light mode"}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleToggle}
              trackColor={{ false: colors.border, true: "#FF6B3560" }}
              thumbColor={isDark ? "#FF6B35" : "#fff"}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Theme Mode</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(["system", "light", "dark"] as const).map((mode, i, arr) => (
            <React.Fragment key={mode}>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setThemeMode(mode); }}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: mode === "system" ? "#10B98120" : mode === "light" ? "#F59E0B20" : "#667EEA20" }]}>
                    <Ionicons
                      name={mode === "system" ? "phone-portrait-outline" : mode === "light" ? "sunny-outline" : "moon-outline"}
                      size={20}
                      color={mode === "system" ? "#10B981" : mode === "light" ? "#F59E0B" : "#667EEA"}
                    />
                  </View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    {mode === "system" ? "System Default" : mode === "light" ? "Light Mode" : "Dark Mode"}
                  </Text>
                </View>
                {themeMode === mode && <Ionicons name="checkmark-circle" size={22} color="#FF6B35" />}
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            </React.Fragment>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>App Info</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: "#FF6B3520" }]}>
                <Ionicons name="receipt-outline" size={20} color="#FF6B35" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Dastak Mobile</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Version 1.0.0</Text>
              </View>
            </View>
          </View>
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
  content: { padding: 20, gap: 8 },
  sectionTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 1, textTransform: "uppercase", marginTop: 16, marginBottom: 4 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  settingDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  divider: { height: 1, marginHorizontal: 16 },
});
