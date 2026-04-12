import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
} from "react-native";
import { User, Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { File as ExpoFsFile } from "expo-file-system";
import { authService } from "@/services/authService";
import { Colors } from "@/constants/Colors";
import { MAX_PROFILE_IMAGE_BYTES } from "@/constants/mediaLimits";
import { logger } from "@/utils/logger";

function getPickedImageByteSize(asset: ImagePicker.ImagePickerAsset): number | null {
  if (typeof asset.fileSize === "number" && asset.fileSize > 0) {
    return asset.fileSize;
  }
  try {
    const file = new ExpoFsFile(asset.uri);
    if (file.exists && typeof file.size === "number" && file.size > 0) {
      return file.size;
    }
  } catch {
    /* e.g. some ph:// or unsupported URIs */
  }
  return null;
}

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
  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [avatar]);

  const avatarUrl = React.useMemo(() => {
    if (!avatar) return null;
    const url = typeof avatar === "object" ? (avatar as { url?: string }).url : avatar;
    if (typeof url === "string" && url.startsWith("public/")) {
      return `https://api.freeapi.app/${url}`;
    }
    return url;
  }, [avatar]);

  const handlePickImage = async () => {
    try {
      const { status, canAskAgain } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        if (!canAskAgain) {
          Alert.alert(
            "Permission Required",
            "You have permanently denied gallery access. Please enable it in your device settings to update your profile picture.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => Linking.openSettings(),
              },
            ],
          );
        } else {
          Alert.alert(
            "Permission Required",
            "We need your permission to access your gallery to let you choose a profile picture.",
          );
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const byteSize = getPickedImageByteSize(asset);
        if (byteSize != null && byteSize > MAX_PROFILE_IMAGE_BYTES) {
          Alert.alert(
            "Image too large",
            `Please choose a photo under 5 MB (this one is about ${(byteSize / (1024 * 1024)).toFixed(1)} MB).`,
          );
          return;
        }

        setIsUploading(true);
        setImageError(false);
        try {
          await authService.updateAvatar(asset.uri);
        } catch (error: unknown) {
          const err = error as {
            response?: { data?: { message?: string } };
            message?: string;
          };
          const msg =
            err.response?.data?.message ||
            err.message ||
            "Could not upload profile photo. Please try again.";
          logger.error("ProfileHeader", "Avatar upload failed", { message: msg });
          Alert.alert("Upload failed", String(msg));
        } finally {
          setIsUploading(false);
        }
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
          ) : typeof avatarUrl === "string" &&
            avatarUrl !== "" &&
            !avatarUrl.includes("via.placeholder.com") &&
            !imageError ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-full h-full rounded-full"
              resizeMode="cover"
              onError={() => setImageError(true)}
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
