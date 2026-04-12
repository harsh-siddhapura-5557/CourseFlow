import { useState, useRef } from "react";
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
import {
  validateEmail,
  validateRegisterPassword,
  validateRegisterUsername,
} from "@/utils/validation";

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
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    // Reset errors
    setErrors({ username: "", email: "", password: "", general: "" });

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password;

    let hasError = false;
    const newErrors = { username: "", email: "", password: "", general: "" };

    const uErr = validateRegisterUsername(username);
    if (uErr) {
      newErrors.username = uErr;
      hasError = true;
    }

    const eErr = validateEmail(trimmedEmail);
    if (eErr) {
      newErrors.email = eErr;
      hasError = true;
    }

    const pErr = validateRegisterPassword(trimmedPassword);
    if (pErr) {
      newErrors.password = pErr;
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
        behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "android" ? "height" : undefined}
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
                  className={`bg-slate-50 p-4 rounded-2xl border ${errors.username ? "border-red-500" : "border-slate-100"} text-slate-900 h-14`}
                  placeholder="johndoe"
                  placeholderTextColor={Colors.muted}
                  value={username}
                  onChangeText={(val) => {
                    setUsername(val.toLowerCase().replace(/\s/g, ""));
                    if (errors.username || errors.general)
                      setErrors({ ...errors, username: "", general: "" });
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username-new"
                  textContentType="username"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => emailRef.current?.focus()}
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
                  ref={emailRef}
                  className={`bg-slate-50 p-4 rounded-2xl border ${errors.email ? "border-red-500" : "border-slate-100"} text-slate-900 h-14`}
                  placeholder="name@example.com"
                  placeholderTextColor={Colors.muted}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errors.email || errors.general)
                      setErrors({ ...errors, email: "", general: "" });
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
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
                    onChangeText={(val) => {
                      setPassword(val);
                      if (errors.password || errors.general)
                        setErrors({ ...errors, password: "", general: "" });
                    }}
                    secureTextEntry={!showPassword}
                    autoComplete="password-new"
                    textContentType="newPassword"
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
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
