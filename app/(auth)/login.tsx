import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { validateLoginIdentifier } from "@/utils/validation";
import { Link, useRouter } from "expo-router";
import { authService } from "@/services/authService";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    // Reset errors
    setErrors({ email: "", password: "", general: "" });

    const trimmedIdentifier = email.trim();
    const trimmedPassword = password;

    let hasError = false;
    const newErrors = { email: "", password: "", general: "" };

    const idErr = validateLoginIdentifier(email);
    if (idErr) {
      newErrors.email = idErr;
      hasError = true;
    }

    if (!trimmedPassword) {
      newErrors.password = "Password is required";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await authService.login(trimmedIdentifier.toLowerCase(), trimmedPassword);
      router.replace("/(tabs)");
    } catch (error: any) {
      const msg = error.message.toLowerCase();
      if (msg.includes("user does not exist") || msg.includes("not found")) {
        setErrors({
          ...newErrors,
          email: "Account not found. Please register first.",
        });
      } else if (
        msg.includes("password") ||
        msg.includes("invalid credentials")
      ) {
        setErrors({
          ...newErrors,
          password: "Incorrect password. Please try again.",
        });
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
        behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "android" ? "height" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        className="flex-1"
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View className="w-full">
            <View className="mb-10">
              <Text className="text-4xl font-bold text-slate-900 mb-2">
                Welcome Back
              </Text>
              <Text className="text-slate-500 text-lg">
                Sign in to continue your learning journey
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
                  Username or Email
                </Text>
                <TextInput
                  className={`bg-slate-50 p-4 rounded-2xl border ${errors.email ? "border-red-500" : "border-slate-100"} text-slate-900 h-14`}
                  placeholder="Username or Email"
                  placeholderTextColor={Colors.muted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email || errors.general)
                      setErrors({ ...errors, email: "", general: "" });
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  textContentType="username"
                  keyboardType="email-address"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => passwordRef.current?.focus()}
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
                    ref={passwordRef}
                    className={`bg-slate-50 p-4 rounded-2xl border ${errors.password ? "border-red-500" : "border-slate-100"} text-slate-900 pr-12 h-14`}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.muted}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password || errors.general)
                        setErrors({ ...errors, password: "", general: "" });
                    }}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
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
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-8">
              <Text className="text-slate-500">Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-bold">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
