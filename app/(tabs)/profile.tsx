import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/authService";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut, User, Settings, Shield, BookOpen, ChevronRight } from "lucide-react-native";

export default function ProfileScreen() {
  const { user } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to sign out?",
      [
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
          } 
        }
      ]
    );
  };

  const menuItems = [
    { icon: <BookOpen size={20} color="#6366f1" />, title: "My Courses", value: "8" },
    { icon: <Settings size={20} color="#6366f1" />, title: "Settings" },
    { icon: <Shield size={20} color="#6366f1" />, title: "Privacy Policy" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-4 border-4 border-white shadow-lg overflow-hidden">
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} className="w-full h-full" />
            ) : (
              <User size={48} color="white" />
            )}
          </View>
          <Text className="text-2xl font-bold text-text mb-1">{user?.username}</Text>
          <Text className="text-muted">{user?.email}</Text>
        </View>

        <View className="bg-card rounded-3xl p-2 border border-slate-100 shadow-sm mb-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              className={`flex-row items-center p-4 ${index !== menuItems.length - 1 ? 'border-b border-slate-50' : ''}`}
            >
              <View className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-4">
                {item.icon}
              </View>
              <Text className="flex-1 text-text font-semibold text-lg">{item.title}</Text>
              {item.value && <Text className="text-muted mr-2 font-medium">{item.value}</Text>}
              <ChevronRight size={20} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-50 p-5 rounded-2xl flex-row items-center justify-center border border-red-100"
        >
          <LogOut size={20} color="#ef4444" className="mr-3" />
          <Text className="text-red-500 font-bold text-lg ml-2">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
