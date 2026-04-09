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
import { Link, useRouter } from "expo-router";
import { authService } from "@/services/authService";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    general: "",
  });
  const router = useRouter();

  const handleRegister = async () => {
    // Reset errors
    setErrors({ username: "", email: "", password: "", general: "" });

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password; // Passwords shouldn't be trimmed usually

    let hasError = false;
    const newErrors = { username: "", email: "", password: "", general: "" };

    if (!trimmedUsername) {
      newErrors.username = "Username is required";
      hasError = true;
    } else if (trimmedUsername.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      hasError = true;
    }

    if (!trimmedEmail) {
      newErrors.email = "Email is required";
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        newErrors.email = "Please enter a valid email address";
        hasError = true;
      }
    }

    if (!trimmedPassword) {
      newErrors.password = "Password is required";
      hasError = true;
    } else if (trimmedPassword.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        username: trimmedUsername.toLowerCase(),
        email: trimmedEmail.toLowerCase(),
        password: trimmedPassword,
        role: "USER",
      });
      Alert.alert("Success", "Account created successfully! Please login.", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (error: any) {
      const msg = error.message.toLowerCase();
      if (msg.includes("username") && msg.includes("exists")) {
        setErrors({ ...newErrors, username: "Username is already taken" });
      } else if (msg.includes("email") && msg.includes("exists")) {
        setErrors({ ...newErrors, email: "Email is already registered" });
      } else {
        setErrors({ ...newErrors, general: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          className="p-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center">
            <View className="mb-10">
              <Text className="text-4xl font-bold text-slate-900 mb-2">
                Join Now
              </Text>
              <Text className="text-slate-500 text-lg">
                Create an account to start learning
              </Text>
            </View>

            <View className="space-y-6">
              {errors.general ? (
                <View className="bg-red-50 p-4 rounded-2xl border border-red-100">
                  <Text className="text-red-500 text-sm font-semibold text-center">
                    {errors.general}
                  </Text>
                </View>
              ) : null}
              <View>
                <Text className="text-slate-900 font-semibold mb-2 ml-1">
                  Username
                </Text>
                <TextInput
                  className={`bg-slate-50 p-4 rounded-2xl border ${errors.username ? "border-red-500" : "border-slate-100"} text-slate-900`}
                  placeholder="johndoe"
                  placeholderTextColor="#94a3b8"
                  value={username}
                  onChangeText={(val) => {
                    setUsername(val.toLowerCase().replace(/\s/g, ""));
                    if (errors.username || errors.general)
                      setErrors({ ...errors, username: "", general: "" });
                  }}
                  autoCapitalize="none"
                />
                {errors.username ? (
                  <Text className="text-red-500 text-xs mt-1 ml-2 font-medium">
                    {errors.username}
                  </Text>
                ) : null}
              </View>

              <View>
                <Text className="text-slate-900 font-semibold mb-2 ml-1">
                  Email Address
                </Text>
                <TextInput
                  className={`bg-slate-50 p-4 rounded-2xl border ${errors.email ? "border-red-500" : "border-slate-100"} text-slate-900`}
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errors.email || errors.general)
                      setErrors({ ...errors, email: "", general: "" });
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {errors.email ? (
                  <Text className="text-red-500 text-xs mt-1 ml-2 font-medium">
                    {errors.email}
                  </Text>
                ) : null}
              </View>

              <View>
                <Text className="text-slate-900 font-semibold mb-2 ml-1">
                  Password
                </Text>
                <View className="relative justify-center">
                  <TextInput
                    className={`bg-slate-50 p-4 rounded-2xl border ${errors.password ? "border-red-500" : "border-slate-100"} text-slate-900 pr-12 h-14`}
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      if (errors.password || errors.general)
                        setErrors({ ...errors, password: "", general: "" });
                    }}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    className="absolute right-0 inset-y-0 px-4 justify-center"
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <Eye size={20} color={Colors.muted} />
                    ) : (
                      <EyeOff size={20} color={Colors.muted} />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <Text className="text-red-500 text-xs mt-1 ml-2 font-medium">
                    {errors.password}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                className={`bg-primary p-4 rounded-2xl items-center justify-center mt-6 ${loading ? "opacity-70" : ""}`}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-8">
              <Text className="text-slate-500">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-bold">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
