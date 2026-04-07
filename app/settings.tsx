import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  Lock,
  Trash2,
  ChevronRight,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  const toggleNotifications = () => {
    setIsNotificationsEnabled((previousState) => !isNotificationsEnabled);
  };

  const handlePlaceholderAction = (title: string) => {
    Alert.alert(
      title,
      `${title} feature will be implemented in the next update.`,
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => console.log("Account deleted"),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Custom Header with Back Button */}
      <View className="px-6 py-4 flex-row items-center bg-white border-b border-slate-50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={Colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <Text className="text-xl font-extrabold text-slate-900">
            Settings
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-[#F8FAFC]"
        contentContainerStyle={{ padding: 24 }}
      >
        {/* Notifications Section */}
        <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2px] mb-4 ml-2">
          Notifications
        </Text>
        <View className="bg-white rounded-[32px] p-2 border border-slate-100 shadow-sm mb-8">
          <View className="flex-row items-center p-5">
            <View className="w-11 h-11 bg-indigo-50 rounded-2xl items-center justify-center mr-4">
              <Bell size={22} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-bold text-lg">
                Push Notifications
              </Text>
              <Text className="text-slate-400 text-xs font-medium">
                Receive app alerts
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#CBD5E1", true: "#A5B4FC" }}
              thumbColor={isNotificationsEnabled ? Colors.primary : "#F8FAFC"}
              ios_backgroundColor="#CBD5E1"
              onValueChange={toggleNotifications}
              value={isNotificationsEnabled}
            />
          </View>
        </View>

        {/* Account Security Section */}
        <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2px] mb-4 ml-2">
          Account Security
        </Text>
        <View className="bg-white rounded-[32px] p-2 border border-slate-100 shadow-sm mb-8">
          <TouchableOpacity
            onPress={() => handlePlaceholderAction("Change Password")}
            className="flex-row items-center p-5 border-b border-slate-50"
          >
            <View className="w-11 h-11 bg-amber-50 rounded-2xl items-center justify-center mr-4">
              <Lock size={22} color={Colors.warning} strokeWidth={2.5} />
            </View>
            <Text className="flex-1 text-slate-900 font-bold text-lg">
              Change Password
            </Text>
            <ChevronRight size={18} color="#CBD5E1" strokeWidth={3} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="flex-row items-center p-5"
          >
            <View className="w-11 h-11 bg-red-50 rounded-2xl items-center justify-center mr-4">
              <Trash2 size={22} color={Colors.error} strokeWidth={2.5} />
            </View>
            <Text className="flex-1 text-red-500 font-bold text-lg">
              Delete Account
            </Text>
            <ChevronRight size={18} color="#CBD5E1" strokeWidth={3} />
          </TouchableOpacity>
        </View>

        <View className="items-center mb-6 mt-4">
          <Text className="text-slate-300 text-[10px] font-black uppercase tracking-[4px]">
            Security Settings • v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
