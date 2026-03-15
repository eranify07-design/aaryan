import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/context/ThemeContext";

export default function AboutDeveloperScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const skills = [
    { label: "React Native", color: "#61DAFB" },
    { label: "TypeScript", color: "#3178C6" },
    { label: "Firebase", color: "#FFCA28" },
    { label: "Expo", color: "#FF6B35" },
    { label: "Node.js", color: "#68A063" },
    { label: "UI/UX Design", color: "#FF6B9D" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={["#1A1A2E", "#16213E"]} style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About Developer</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) }]}>
        <View style={styles.profileSection}>
          <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>A</Text>
          </LinearGradient>
          <Text style={[styles.profileName, { color: colors.text }]}>Aaryan Prajapati</Text>
          <View style={[styles.roleBadge, { backgroundColor: "#FF6B3520" }]}>
            <Ionicons name="code-slash" size={14} color="#FF6B35" />
            <Text style={[styles.roleText, { color: "#FF6B35" }]}>Mobile App Developer</Text>
          </View>
        </View>

        <View style={[styles.bioCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.bioTitle, { color: colors.text }]}>About</Text>
          <Text style={[styles.bioText, { color: colors.textSecondary }]}>
            "Aaryan Prajapati is a passionate developer focused on building modern and efficient mobile applications."
          </Text>
          <View style={[styles.quoteBar, { backgroundColor: "#FF6B35" }]} />
        </View>

        <View style={[styles.skillsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.skillsTitle, { color: colors.text }]}>Skills & Technologies</Text>
          <View style={styles.skillsGrid}>
            {skills.map((skill) => (
              <View key={skill.label} style={[styles.skillChip, { backgroundColor: skill.color + "15", borderColor: skill.color + "40" }]}>
                <View style={[styles.skillDot, { backgroundColor: skill.color }]} />
                <Text style={[styles.skillLabel, { color: skill.color }]}>{skill.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Dastak Mobile Stats</Text>
          <View style={styles.statsGrid}>
            {[
              { label: "Screens", value: "13+", icon: "phone-portrait-outline", color: "#FF6B35" },
              { label: "Features", value: "20+", icon: "sparkles-outline", color: "#667EEA" },
              { label: "Firebase Collections", value: "4", icon: "cloud-outline", color: "#FFCA28" },
              { label: "Dark Mode", value: "Yes", icon: "moon-outline", color: "#2EC4B6" },
            ].map((stat) => (
              <View key={stat.label} style={[styles.statItem, { backgroundColor: stat.color + "10" }]}>
                <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL("mailto:myuse077@gmail.com"); }}
          activeOpacity={0.8}
        >
          <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.contactBtn}>
            <Ionicons name="mail-outline" size={20} color="#fff" />
            <Text style={styles.contactBtnText}>Get in Touch</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  profileSection: { alignItems: "center", paddingVertical: 24, gap: 12 },
  profileAvatar: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", shadowColor: "#FF6B35", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  profileInitial: { fontSize: 40, fontFamily: "Inter_700Bold", color: "#fff" },
  profileName: { fontSize: 26, fontFamily: "Inter_700Bold" },
  roleBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  roleText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  bioCard: { borderRadius: 16, padding: 20, borderWidth: 1, gap: 12, position: "relative", overflow: "hidden" },
  bioTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  bioText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24, fontStyle: "italic" },
  quoteBar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  skillsCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 14 },
  skillsTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  skillDot: { width: 6, height: 6, borderRadius: 3 },
  skillLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 14 },
  statsTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statItem: { flex: 1, minWidth: "44%", borderRadius: 12, padding: 14, alignItems: "center", gap: 6 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  contactBtn: { borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 8, shadowColor: "#FF6B35", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  contactBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
