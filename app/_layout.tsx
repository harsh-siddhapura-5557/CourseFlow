import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import OfflineBanner from "@/components/OfflineBanner";
import { notificationService } from "@/services/notificationService";

export default function RootLayout() {
  const { isInitialized, checkAuth, token } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    notificationService.requestPermissions();
    notificationService.trackActivity();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!token && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (token && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [token, segments, isInitialized]);

  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <StatusBar style="auto" />
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#f8fafc" },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="course/[id]"
          options={{
            headerShown: true,
            headerTitle: "Course Details",
            headerBackTitle: "Back",
            headerShadowVisible: false,
            headerStyle: { backgroundColor: "#f8fafc" },
          }}
        />
        <Stack.Screen
          name="webview"
          options={{
            headerShown: true,
            headerTitle: "Course Content",
          }}
        />
      </Stack>
    </View>
  );
}
