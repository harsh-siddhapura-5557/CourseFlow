import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { AuthState, User } from "@/types";
import api from "@/services/api";

export const useAuthStore = create<AuthState>((set, get) => ({
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
      if (token) {
        // Always try to fetch latest profile from server
        const response = await api.get("/users/current-user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = response.data.data;
        if (user) {
          await SecureStore.setItemAsync("user_data", JSON.stringify(user));
          set({ token, user, isInitialized: true });
          return;
        }
      }

      const userData = await SecureStore.getItemAsync("user_data");
      if (token && userData) {
        set({ token, user: JSON.parse(userData), isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch (error: any) {
      console.log("[AuthStore] CheckAuth error:", error.message);
      const token = await SecureStore.getItemAsync("auth_token");
      const userData = await SecureStore.getItemAsync("user_data");
      if (token && userData) {
        set({ token, user: JSON.parse(userData), isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    }
  },
  updateAvatar: async (avatar) => {
    const { user, token } = get();
    if (user && token) {
      try {
        const formData = new FormData();
        const filename = avatar.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const type = match ? `image/${match[1]}` : `image`;

        formData.append("avatar", {
          uri: avatar,
          name: filename,
          type,
        } as any);

        const response = await api.patch("/users/avatar", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const updatedUser = response.data.data;
        if (updatedUser) {
          await SecureStore.setItemAsync(
            "user_data",
            JSON.stringify(updatedUser),
          );
          set({ user: updatedUser });
        }
      } catch (error: any) {
        console.error("[AuthStore] updateAvatar error:", error.message);
        // Fallback to local if server fails (not recommended but for UX)
        const updatedUser = { ...user, avatar };
        await SecureStore.setItemAsync(
          "user_data",
          JSON.stringify(updatedUser),
        );
        set({ user: updatedUser });
      }
    }
  },
}));
