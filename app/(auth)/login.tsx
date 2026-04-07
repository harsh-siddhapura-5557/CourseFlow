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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // FreeAPI login can take email OR username
      // We'll pass it as 'email' but it can be username too
      await authService.login(email.toLowerCase().trim(), password);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
          <View className="flex-1 justify-center">
            <View className="mb-10">
              <Text className="text-4xl font-bold text-slate-900 mb-2">
                Welcome Back
              </Text>
              <Text className="text-slate-500 text-lg">
                Sign in to continue your learning journey
              </Text>
            </View>

            <View className="space-y-6">
              <View>
                <Text className="text-slate-900 font-semibold mb-2 ml-1">Username or Email</Text>
                <TextInput
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-900 h-14"
                  placeholder="Username or Email"
                  placeholderTextColor={Colors.muted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="text-slate-900 font-semibold mb-2 ml-1">
                  Password
                </Text>
                <View className="relative justify-center">
                  <TextInput
                    className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-900 pr-12 h-14"
                    placeholder="••••••••"
                    placeholderTextColor={Colors.muted}
                    value={password}
                    onChangeText={setPassword}
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
