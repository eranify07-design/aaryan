import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const { user, loading } = useAuth();
  const insets = useSafeAreaInsets();

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const devTextOpacity = useRef(new Animated.Value(0)).current;
  const devTextTranslate = useRef(new Animated.Value(20)).current;

  const [minDelayDone, setMinDelayDone] = useState(false);

  // Run animations and minimum splash timer once on mount
  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: false }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: false }),
      ]),
      Animated.timing(titleOpacity, { toValue: 1, duration: 500, delay: 200, useNativeDriver: false }),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, delay: 100, useNativeDriver: false }),
      Animated.parallel([
        Animated.timing(devTextOpacity, { toValue: 1, duration: 500, useNativeDriver: false }),
        Animated.timing(devTextTranslate, { toValue: 0, duration: 500, useNativeDriver: false }),
      ]),
    ]);
    sequence.start();

    // Minimum 3s splash for animation, then navigate
    const minTimer = setTimeout(() => setMinDelayDone(true), 3000);
    return () => clearTimeout(minTimer);
  }, []);

  // Navigate as soon as BOTH auth resolved AND minimum splash time done
  useEffect(() => {
    if (loading || !minDelayDone) return;
    router.replace(user ? "/home" : "/auth/login");
  }, [loading, minDelayDone, user]);

  return (
    <LinearGradient
      colors={["#1A1A2E", "#16213E", "#0F3460"]}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Image
            source={require("../assets/images/logo.jpg")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.Text style={[styles.appName, { opacity: titleOpacity }]}>
          Dastak Mobile
        </Animated.Text>

        <Animated.Text style={[styles.appSubtitle, { opacity: subtitleOpacity }]}>
          Billing App
        </Animated.Text>

        <Animated.View
          style={[
            styles.devRow,
            {
              opacity: devTextOpacity,
              transform: [{ translateY: devTextTranslate }],
            },
          ]}
        >
          <View style={styles.dividerLine} />
          <Text style={styles.devText}>Developed By</Text>
          <View style={styles.dividerLine} />
        </Animated.View>

        <Animated.Text style={[styles.devName, { opacity: devTextOpacity }]}>
          Aaryan Prajapati
        </Animated.Text>
      </View>

      <Animated.View style={[styles.footer, { opacity: devTextOpacity }]}>
        <View style={styles.dotRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  logoContainer: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    backgroundColor: "#fff",
  },
  logoImage: {
    width: 160,
    height: 160,
  },
  appName: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 24,
  },
  devRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    maxWidth: 60,
  },
  devText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  devName: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    color: "#FF6B35",
  },
  footer: {
    paddingBottom: 32,
    alignItems: "center",
  },
  dotRow: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  dotActive: {
    backgroundColor: "#FF6B35",
    width: 18,
  },
});
