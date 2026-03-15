import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function SignupScreen() {
  const { colors } = useTheme();
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !username.trim() || !mobile.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim(), username.trim().toLowerCase(), mobile.trim(), password);
      router.replace("/home");
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Signup Failed", e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Full Name", icon: "person-outline", value: name, onChangeText: setName, placeholder: "Enter your full name", keyboardType: "default" as const },
    { label: "Email", icon: "mail-outline", value: email, onChangeText: setEmail, placeholder: "Enter your email", keyboardType: "email-address" as const },
    { label: "Username", icon: "at-outline", value: username, onChangeText: setUsername, placeholder: "Choose a username", keyboardType: "default" as const },
    { label: "Mobile Number", icon: "call-outline", value: mobile, onChangeText: setMobile, placeholder: "Enter mobile number", keyboardType: "phone-pad" as const },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient colors={["#1A1A2E", "#16213E"]} style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo.jpg")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join Dastak Mobile today</Text>
        </LinearGradient>

        <View style={[styles.form, { backgroundColor: colors.background }]}>
          {fields.map((field) => (
            <View key={field.label} style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{field.label}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <Ionicons name={field.icon as any} size={20} color={colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.textTertiary}
                  value={field.value}
                  onChangeText={field.onChangeText}
                  keyboardType={field.keyboardType}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Create a password"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={["#FF6B35", "#E55A24"]} style={styles.signupBtnGradient}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupBtnText}>Create Account</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 36,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    left: 20,
    top: 24,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: "#fff",
  },
  logo: {
    width: 88,
    height: 88,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
  },
  form: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  signupBtn: {
    marginTop: 8,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signupBtnGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  signupBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  loginLink: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FF6B35",
  },
});
