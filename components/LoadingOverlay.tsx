import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay = ({ message = "Loading..." }: LoadingOverlayProps) => (
  <View className="flex-1 items-center justify-center bg-background/80 absolute inset-0 z-50">
    <View className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 items-center">
      <ActivityIndicator size="large" color="#6366f1" />
      <Text className="text-text font-semibold mt-4 text-base">{message}</Text>
    </View>
  </View>
);

export default LoadingOverlay;
