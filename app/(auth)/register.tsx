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
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password,
        role: "USER",
      });
      Alert.alert("Success", "Account created successfully! Please login.", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (error: any) {
      console.error("Registration failed:", error);
      const errorMessage =
        error.message || "Something went wrong. Please try again.";
      Alert.alert("Registration Failed", errorMessage);
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
              <View>
                <Text className="text-slate-900 font-semibold mb-2 ml-1">
                  Username
                </Text>
                <TextInput
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-900"
                  placeholder="johndoe"
                  placeholderTextColor="#94a3b8"
                  value={username}
                  onChangeText={(val) =>
                    setUsername(val.toLowerCase().replace(/\s/g, ""))
                  }
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="text-slate-900 font-semibold mb-2 ml-1">
                  Email Address
                </Text>
                <TextInput
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-900"
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
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
                    placeholderTextColor="#94a3b8"
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
