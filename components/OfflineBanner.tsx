import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { WifiOff } from "lucide-react-native";
import NetInfo from "@react-native-community/netinfo";

const OfflineBanner = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  if (isConnected) return null;

  return (
    <View className="bg-red-500 py-3 flex-row items-center justify-center px-4">
      <WifiOff size={18} color="white" />
      <Text className="text-white font-bold ml-2">You are currently offline. Some features may be unavailable.</Text>
    </View>
  );
};

export default OfflineBanner;
