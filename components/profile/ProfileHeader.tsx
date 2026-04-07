import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { User, Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/store/useAuthStore";
import { Colors } from "@/constants/Colors";

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatar?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  email,
  avatar,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { updateAvatar } = useAuthStore();

  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need your permission to access your gallery.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploading(true);
        await updateAvatar(result.assets[0].uri);
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Image picking error:", error);
      Alert.alert("Error", "Failed to update profile picture");
      setIsUploading(false);
    }
  };

  return (
    <View className="items-center mb-10 pt-4">
      <View className="relative">
        <View className="w-32 h-32 bg-indigo-50 rounded-full items-center justify-center border-4 border-white shadow-2xl overflow-hidden">
          {isUploading ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : avatar ? (
            <Image
              source={{ uri: avatar }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="bg-indigo-500 w-full h-full items-center justify-center">
              <User size={64} color={Colors.white} strokeWidth={1.5} />
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handlePickImage}
          disabled={isUploading}
          activeOpacity={0.9}
          className="absolute bottom-2 right-1 bg-white w-10 h-10 rounded-full items-center justify-center border border-slate-100 shadow-lg"
        >
          <Camera size={18} color={Colors.primary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View className="items-center mt-5">
        <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {name}
        </Text>
        <Text className="text-slate-500 font-semibold text-base mt-1">
          {email}
        </Text>
      </View>
    </View>
  );
};
