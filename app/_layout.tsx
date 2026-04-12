import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCourseStore } from "@/store/useCourseStore";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import OfflineBanner from "@/components/OfflineBanner";
import { notificationService } from "@/services/notificationService";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { isInitialized, checkAuth, token } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await checkAuth();
        if (useAuthStore.getState().token) {
          await useCourseStore.getState().mergeRemoteProgressAfterLogin();
        }
        await notificationService.requestPermissions();
        await notificationService.trackActivity();
        const interval = setInterval(
          () => {
            notificationService.trackActivity();
          },
          12 * 60 * 60 * 1000,
        );
        return () => clearInterval(interval);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsAppReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (isInitialized && isAppReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isInitialized, isAppReady]);

  useEffect(() => {
    if (!isInitialized || !isAppReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!token && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (token && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [token, segments, isInitialized, isAppReady]);

  if (!isInitialized || !isAppReady) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8fafc]">
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
            headerShown: false,
            headerTitle: "Course Details",
          }}
        />
        <Stack.Screen
          name="webview"
          options={{
            headerShown: false,
            headerTitle: "Course Content",
          }}
        />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="change-password" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
