import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { authService } from "@/services/authService";

const MIN_LENGTH = 8;

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    current: "",
    newPass: "",
    confirm: "",
    general: "",
  });

  const clearFieldError = (field: keyof typeof errors) => {
    setErrors((e) => ({ ...e, [field]: "", general: "" }));
  };

  const validate = (): boolean => {
    const next = { current: "", newPass: "", confirm: "", general: "" };
    let ok = true;

    if (!currentPassword) {
      next.current = "Current password is required";
      ok = false;
    }
    if (!newPassword) {
      next.newPass = "New password is required";
      ok = false;
    } else if (newPassword.length < MIN_LENGTH) {
      next.newPass = `Use at least ${MIN_LENGTH} characters`;
      ok = false;
    }
    if (newPassword && currentPassword && newPassword === currentPassword) {
      next.newPass = "New password must be different from your current password";
      ok = false;
    }
    if (!confirmPassword) {
      next.confirm = "Please confirm your new password";
      ok = false;
    } else if (newPassword !== confirmPassword) {
      next.confirm = "Passwords do not match";
      ok = false;
    }

    setErrors(next);
    return ok;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({ current: "", newPass: "", confirm: "", general: "" });
    try {
      await authService.changePassword(currentPassword, newPassword);
      Alert.alert(
        "Password updated",
        "Your password has been changed successfully.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error: unknown) {
      const msg = (error as Error).message?.toLowerCase() || "";
      if (msg.includes("invalid old password") || msg.includes("old password")) {
        setErrors((e) => ({
          ...e,
          current: "Current password is incorrect",
        }));
      } else {
        setErrors((e) => ({
          ...e,
          general: (error as Error).message || "Something went wrong",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
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
            Change Password
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 bg-[#F8FAFC]"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-slate-500 text-base font-medium leading-6 mb-8 px-1">
            For your security, enter your current password and choose a strong new
            one. Use at least {MIN_LENGTH} characters.
          </Text>

          {errors.general ? (
            <View className="bg-red-50 p-4 rounded-2xl border border-red-100 mb-6">
              <Text className="text-red-600 text-sm font-semibold text-center">
                {errors.general}
              </Text>
            </View>
          ) : null}

          <View className="mb-5">
            <Text className="text-slate-900 font-semibold mb-2 ml-1">
              Current password
            </Text>
            <View className="relative justify-center">
              <TextInput
                className={`bg-white p-4 rounded-2xl border ${errors.current ? "border-red-500" : "border-slate-100"} text-slate-900 pr-12 h-14`}
                placeholder="Enter current password"
                placeholderTextColor={Colors.muted}
                value={currentPassword}
                onChangeText={(t) => {
                  setCurrentPassword(t);
                  if (errors.current || errors.general) clearFieldError("current");
                }}
                secureTextEntry={!showCurrent}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                className="absolute right-0 inset-y-0 px-4 justify-center"
                onPress={() => setShowCurrent(!showCurrent)}
                activeOpacity={0.7}
              >
                {showCurrent ? (
                  <Eye size={20} color={Colors.muted} />
                ) : (
                  <EyeOff size={20} color={Colors.muted} />
                )}
              </TouchableOpacity>
            </View>
            {errors.current ? (
              <Text className="text-red-500 text-xs mt-1 ml-2 font-medium">
                {errors.current}
              </Text>
            ) : null}
          </View>

          <View className="mb-5">
            <Text className="text-slate-900 font-semibold mb-2 ml-1">
              New password
            </Text>
            <View className="relative justify-center">
              <TextInput
                className={`bg-white p-4 rounded-2xl border ${errors.newPass ? "border-red-500" : "border-slate-100"} text-slate-900 pr-12 h-14`}
                placeholder="Enter new password"
                placeholderTextColor={Colors.muted}
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  if (errors.newPass || errors.general) clearFieldError("newPass");
                }}
                secureTextEntry={!showNew}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                className="absolute right-0 inset-y-0 px-4 justify-center"
                onPress={() => setShowNew(!showNew)}
                activeOpacity={0.7}
              >
                {showNew ? (
                  <Eye size={20} color={Colors.muted} />
                ) : (
                  <EyeOff size={20} color={Colors.muted} />
                )}
              </TouchableOpacity>
            </View>
            {errors.newPass ? (
              <Text className="text-red-500 text-xs mt-1 ml-2 font-medium">
                {errors.newPass}
              </Text>
            ) : null}
          </View>

          <View className="mb-8">
            <Text className="text-slate-900 font-semibold mb-2 ml-1">
              Confirm new password
            </Text>
            <View className="relative justify-center">
              <TextInput
                className={`bg-white p-4 rounded-2xl border ${errors.confirm ? "border-red-500" : "border-slate-100"} text-slate-900 pr-12 h-14`}
                placeholder="Re-enter new password"
                placeholderTextColor={Colors.muted}
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (errors.confirm || errors.general) clearFieldError("confirm");
                }}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                className="absolute right-0 inset-y-0 px-4 justify-center"
                onPress={() => setShowConfirm(!showConfirm)}
                activeOpacity={0.7}
              >
                {showConfirm ? (
                  <Eye size={20} color={Colors.muted} />
                ) : (
                  <EyeOff size={20} color={Colors.muted} />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirm ? (
              <Text className="text-red-500 text-xs mt-1 ml-2 font-medium">
                {errors.confirm}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            className={`bg-primary py-4 rounded-2xl items-center justify-center ${loading ? "opacity-70" : ""}`}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Update password</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
