import React from "react";
import { View, ScrollView, Alert, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import { useCourseStore } from "@/store/useCourseStore";
import { authService } from "@/services/authService";
import {
  LogOut,
  Settings,
  BookOpen,
  GraduationCap,
  Star,
  Trophy,
} from "lucide-react-native";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StatsCard } from "@/components/profile/StatsCard";
import { MenuItem } from "@/components/profile/MenuItem";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { enrolled, bookmarks } = useCourseStore();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await authService.logout();
          } catch (error) {
            Alert.alert("Error", "Logout failed");
          }
        },
      },
    ]);
  };

  const handleNavigateToEnrolled = () => {
    router.push("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="px-5 pt-2 pb-3 bg-white border-b border-slate-50">
        <Text className="text-3xl font-bold text-slate-900 tracking-tight">
          My Profile
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-[#F8FAFC]"
      >
        <ProfileHeader
          name={user?.username || "Guest User"}
          email={user?.email || "guest@example.com"}
          avatar={user?.avatar}
        />

        <View className="flex-row justify-between mb-10">
          <StatsCard
            label="Enrolled"
            value={enrolled.length}
            icon={
              <GraduationCap
                size={22}
                color={Colors.primary}
                strokeWidth={2.5}
              />
            }
          />
          <StatsCard
            label="Completed"
            value={0}
            icon={<Trophy size={22} color={Colors.warning} strokeWidth={2.5} />}
          />
          <StatsCard
            label="Bookmarks"
            value={bookmarks.length}
            icon={<Star size={22} color={Colors.error} strokeWidth={2.5} />}
          />
        </View>

        <View className="mb-10">
          <Text className="text-slate-900 text-xl font-extrabold mb-5 ml-2">
            Account Settings
          </Text>
          <View className="bg-white rounded-[36px] p-2 border border-slate-100 shadow-sm">
            <MenuItem
              icon={
                <BookOpen size={20} color={Colors.primary} strokeWidth={2} />
              }
              title="My Courses"
              value={enrolled.length}
              onPress={handleNavigateToEnrolled}
            />
            <MenuItem
              icon={
                <Settings size={20} color={Colors.secondary} strokeWidth={2} />
              }
              title="Settings"
              isLast
              onPress={() => router.push("/settings")}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          className="bg-red-50/50 py-6 rounded-[28px] flex-row items-center justify-center border border-red-100 mb-10"
        >
          <LogOut size={22} color={Colors.error} strokeWidth={2.5} />
          <Text className="text-red-500 font-extrabold text-lg ml-4">
            Sign Out
          </Text>
        </TouchableOpacity>

        <View className="items-center mb-6">
          <Text className="text-slate-300 text-[10px] font-black uppercase tracking-[4px]">
            CourseFlow • Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
