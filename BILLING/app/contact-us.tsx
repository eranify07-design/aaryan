import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/context/ThemeContext";

const AUTO_MESSAGE = encodeURIComponent("Help! Help! Regarding our app Dastak Mobile. Need help from developer Aaryan Prajapati.");

export default function ContactUsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const openEmail = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = "mailto:myuse077@gmail.com?subject=Dastak Mobile Support&body=Hello, I need help with Dastak Mobile.";
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Alert.alert("Error", "Email client not found");
  };

  const openWhatsApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = `https://wa.me/919106476782?text=${AUTO_MESSAGE}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Alert.alert("Error", "WhatsApp not installed");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={["#1A1A2E", "#16213E"]} style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Us</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) }]}>
        <View style={styles.heroSection}>
          <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.heroIcon}>
            <Ionicons name="headset" size={40} color="#fff" />
          </LinearGradient>
          <Text style={[styles.heroTitle, { color: colors.text }]}>We're Here to Help</Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
            Reach out to our developer for any support or questions
          </Text>
        </View>

        <TouchableOpacity onPress={openEmail} activeOpacity={0.8}>
          <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <LinearGradient colors={["#667EEA", "#764BA2"]} style={styles.contactIcon}>
              <Ionicons name="mail" size={24} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Email</Text>
              <Text style={[styles.contactValue, { color: colors.text }]}>myuse077@gmail.com</Text>
              <Text style={[styles.contactAction, { color: colors.primary }]}>Tap to email</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={openWhatsApp} activeOpacity={0.8}>
          <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <LinearGradient colors={["#25D366", "#128C7E"]} style={styles.contactIcon}>
              <Ionicons name="logo-whatsapp" size={24} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>WhatsApp</Text>
              <Text style={[styles.contactValue, { color: colors.text }]}>+91 9106476782</Text>
              <Text style={[styles.contactAction, { color: "#25D366" }]}>Tap to chat</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        <View style={[styles.messageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.messageLabel, { color: colors.textSecondary }]}>Auto WhatsApp Message</Text>
          <Text style={[styles.messageText, { color: colors.text }]}>
            "Help! Help! Regarding our app Dastak Mobile. Need help from developer Aaryan Prajapati."
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: "#FF6B3510", borderColor: "#FF6B3530" }]}>
          <Ionicons name="information-circle-outline" size={20} color="#FF6B35" />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Response time is typically within 24 hours. For urgent issues, use WhatsApp for faster support.
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
  heroSection: { alignItems: "center", paddingVertical: 24, gap: 12 },
  heroIcon: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", shadowColor: "#FF6B35", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  heroTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  heroSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 280 },
  contactCard: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 16, gap: 14, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  contactIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 2 },
  contactValue: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  contactAction: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  messageCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 8 },
  messageLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  messageText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, fontStyle: "italic" },
  infoCard: { flexDirection: "row", gap: 10, borderRadius: 12, padding: 14, borderWidth: 1, alignItems: "flex-start" },
  infoText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
});
