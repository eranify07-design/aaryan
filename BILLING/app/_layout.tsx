import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { ShopProvider } from "@/context/ShopContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" options={{ animation: "none" }} />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />
      <Stack.Screen name="home" />
      <Stack.Screen name="shop/[shopId]/dashboard" />
      <Stack.Screen name="shop/[shopId]/add-product" />
      <Stack.Screen name="shop/[shopId]/products" />
      <Stack.Screen name="shop/[shopId]/edit-product/[id]" />
      <Stack.Screen name="shop/[shopId]/generate-bill" />
      <Stack.Screen name="shop/[shopId]/sales-analyzer" />
      <Stack.Screen name="shop/[shopId]/profit-analyzer" />
      <Stack.Screen name="shop/[shopId]/most-selling" />
      <Stack.Screen name="shop/[shopId]/sales-history" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="contact-us" />
      <Stack.Screen name="credits" />
      <Stack.Screen name="about-developer" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <ShopProvider>
              <QueryClientProvider client={queryClient}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </QueryClientProvider>
            </ShopProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
