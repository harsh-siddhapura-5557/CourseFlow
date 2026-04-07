import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { AuthState, User } from "@/types";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isInitialized: false,
  login: async (user, token) => {
    await SecureStore.setItemAsync("auth_token", token);
    await SecureStore.setItemAsync("user_data", JSON.stringify(user));
    set({ user, token });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync("auth_token");
    await SecureStore.deleteItemAsync("user_data");
    set({ user: null, token: null });
  },
  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      const userData = await SecureStore.getItemAsync("user_data");
      if (token && userData) {
        set({ token, user: JSON.parse(userData), isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch (error) {
      set({ isInitialized: true });
    }
  },
}));
