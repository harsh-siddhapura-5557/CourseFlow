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

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
          <View className="flex-1 justify-center">
            <View className="mb-10">
              <Text className="text-4xl font-bold text-text mb-2">
                Join Now
              </Text>
              <Text className="text-muted text-lg">
                Create an account to start learning
              </Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-text font-semibold mb-2 ml-1">
                  Username
                </Text>
                <TextInput
                  className="bg-card p-4 rounded-2xl border border-slate-200 text-text"
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
                <Text className="text-text font-semibold mb-2 ml-1">
                  Email Address
                </Text>
                <TextInput
                  className="bg-card p-4 rounded-2xl border border-slate-200 text-text"
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View>
                <Text className="text-text font-semibold mb-2 ml-1">
                  Password
                </Text>
                <TextInput
                  className="bg-card p-4 rounded-2xl border border-slate-200 text-text"
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                className={`bg-primary p-4 rounded-2xl items-center justify-center mt-4 ${loading ? "opacity-70" : ""}`}
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
              <Text className="text-muted">Already have an account? </Text>
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
